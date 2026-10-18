-- Jinx CBT-I prototype — initial schema
-- All times stored as UTC. User timezone stored on profile (default Asia/Bangkok).
-- Sleep night definition: night_date = the calendar date the night STARTED, in the user's timezone.

-- ─────────────────────────────────────────────
-- 1. PROFILES
-- ─────────────────────────────────────────────
create table profiles (
  id                         uuid primary key references auth.users(id) on delete cascade,
  nickname                   text not null,
  timezone                   text not null default 'Asia/Bangkok',
  consent_version            text,
  consent_at                 timestamptz,
  disclaimer_acknowledged_at timestamptz,
  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- ─────────────────────────────────────────────
-- 2. ASSESSMENT 1
-- One row per user. Populated progressively as the user moves through Assessment 1.
-- ─────────────────────────────────────────────
create table assessment_1 (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null unique references profiles(id) on delete cascade,

  -- ISI
  isi_score              int check (isi_score between 0 and 28),
  severity_label         text check (severity_label in ('none','subthreshold','moderate','severe')),

  -- Sleep type and duration
  insomnia_type          text check (insomnia_type in ('onset','maintenance','early_morning','mixed')),
  duration_label         text check (duration_label in ('acute','chronic')),

  -- Safety flags
  selfharm_flag_raised   boolean not null default false,
  selfharm_flagged_at    timestamptz,

  -- Red flags and clearance
  red_flags              text[] not null default '{}',
  cleared_flags          text[] not null default '{}',
  clearance_attested_at  timestamptz,

  -- Contraindications
  contraindications      text[] not null default '{}',

  -- Routing
  routing_decision       text check (routing_decision in (
    'tips_only',
    'jinx_light_track',
    'jinx_full_track',
    'referral_gated',
    'circadian_not_supported_v1',
    'crisis_stop'
  )),

  completed_at           timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create trigger assessment_1_updated_at
  before update on assessment_1
  for each row execute function set_updated_at();

-- ─────────────────────────────────────────────
-- 3. DIARY ENTRIES
-- Covers baseline, treatment, light-track, and maintenance phases.
-- TST and SE are computed columns.
-- ─────────────────────────────────────────────
create table diary_entries (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references profiles(id) on delete cascade,

  -- Night identity
  night_date       date not null,           -- calendar date the night STARTED (user's timezone)
  phase            text not null check (phase in (
    'baseline', 'baseline_restart', 'treatment', 'light_track', 'maintenance'
  )),
  baseline_attempt int not null default 1,  -- increments when baseline restarts

  -- Raw inputs
  time_into_bed    timestamptz not null,    -- UTC
  time_out_of_bed  timestamptz not null,    -- UTC
  sol_minutes      int not null check (sol_minutes >= 0),
  waso_minutes     int not null check (waso_minutes >= 0),
  quality_rating   int not null check (quality_rating between 1 and 5),

  -- Computed (filled by server action before insert)
  tib_minutes      int not null,            -- (time_out_of_bed - time_into_bed) in minutes
  tst_minutes      int not null,            -- tib_minutes - sol_minutes - waso_minutes
  se_percent       numeric(5,2) not null,   -- tst_minutes / tib_minutes * 100

  -- Validity (validated server-side)
  is_valid         boolean not null default false,
  invalid_reason   text,                    -- human-readable reason if not valid

  -- Submission time (used for 36h validity window check)
  logged_at        timestamptz not null default now(),

  created_at       timestamptz not null default now(),

  -- One valid entry per night per phase attempt
  unique (user_id, night_date, phase, baseline_attempt)
);

create index diary_entries_user_id_idx on diary_entries(user_id);
create index diary_entries_phase_idx on diary_entries(user_id, phase, baseline_attempt);

-- ─────────────────────────────────────────────
-- 4. EXTRA SCREENS (after baseline, before tiering)
-- ─────────────────────────────────────────────
create table extra_screens (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null unique references profiles(id) on delete cascade,
  ess_score        int check (ess_score between 0 and 24),
  dbas_mean_score  numeric(4,2),            -- mean of 16 items, each 0–10
  psas_score       int,                     -- placeholder; scale TBD
  completed_at     timestamptz,
  created_at       timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- 5. TREATMENT PLANS (full track)
-- ─────────────────────────────────────────────
create table treatment_plans (
  id                                    uuid primary key default gen_random_uuid(),
  user_id                               uuid not null unique references profiles(id) on delete cascade,

  -- Tier assignment
  assigned_tier                         int not null check (assigned_tier in (1,2,3)),
  avg_se_at_tiering                     numeric(5,2),
  avg_sol_at_tiering                    int,
  avg_waso_at_tiering                   int,
  avg_tst_at_tiering                    int,
  ess_score_at_tiering                  int,
  dbas_mean_at_tiering                  numeric(4,2),
  psas_score_at_tiering                 int,

  -- Sleep window
  prescribed_initial_sleep_window_min   int,  -- minutes
  current_sleep_window_min              int,  -- minutes; updates as window changes
  prescribed_wake_time                  time, -- fixed wake time (user's timezone)
  prescribed_bed_time                   time, -- calculated from wake - window

  -- Progress
  treatment_started_at                  timestamptz,
  current_week                          int not null default 1,

  -- Dormant user state
  plan_frozen                           boolean not null default false,
  plan_frozen_at                        timestamptz,
  consecutive_missed_checkins           int not null default 0,
  last_checkin_date                     date,

  created_at                            timestamptz not null default now(),
  updated_at                            timestamptz not null default now()
);

create trigger treatment_plans_updated_at
  before update on treatment_plans
  for each row execute function set_updated_at();

-- ─────────────────────────────────────────────
-- 6. LIGHT TRACK PROGRESS
-- ─────────────────────────────────────────────
create table light_track_progress (
  id                           uuid primary key default gen_random_uuid(),
  user_id                      uuid not null unique references profiles(id) on delete cascade,

  started_at                   timestamptz not null default now(),
  current_week                 int not null default 1,
  last_checkin_at              timestamptz,

  isi_week2_score              int check (isi_week2_score between 0 and 28),
  isi_week2_at                 timestamptz,
  isi_week4_score              int check (isi_week4_score between 0 and 28),
  isi_week4_at                 timestamptz,

  completed_at                 timestamptz,
  outcome                      text check (outcome in ('remission','continue','escalated_to_full')),

  -- Dormant user state
  plan_frozen                  boolean not null default false,
  plan_frozen_at               timestamptz,
  consecutive_missed_checkins  int not null default 0,
  last_checkin_date            date,

  created_at                   timestamptz not null default now(),
  updated_at                   timestamptz not null default now()
);

create trigger light_track_progress_updated_at
  before update on light_track_progress
  for each row execute function set_updated_at();

-- ─────────────────────────────────────────────
-- 7. ISI REASSESSMENTS
-- ─────────────────────────────────────────────
create table isi_reassessments (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references profiles(id) on delete cascade,
  score          int not null check (score between 0 and 28),
  baseline_score int,                 -- for response/remission comparison
  week_number    int not null,
  track          text not null check (track in ('light','full')),
  assessed_at    timestamptz not null default now()
);

create index isi_reassessments_user_id_idx on isi_reassessments(user_id);

-- ─────────────────────────────────────────────
-- 8. ANALYTICS EVENTS
-- ─────────────────────────────────────────────
create table analytics_events (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references profiles(id) on delete set null,  -- nullable for pre-auth events
  event_name   text not null,
  metadata     jsonb not null default '{}',
  page_context text,
  created_at   timestamptz not null default now()
);

create index analytics_events_event_name_idx on analytics_events(event_name);
create index analytics_events_user_id_idx on analytics_events(user_id);
create index analytics_events_created_at_idx on analytics_events(created_at desc);

-- ─────────────────────────────────────────────
-- 9. FEEDBACK
-- ─────────────────────────────────────────────
create table feedback (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references profiles(id) on delete set null,
  text         text not null,
  page_context text,
  created_at   timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- 10. CLINICAL CONFIG
-- Single source of truth for all clinical thresholds.
-- Never hardcode these in application code.
-- ─────────────────────────────────────────────
create table clinical_config (
  key         text primary key,
  value       text not null,
  description text,
  status      text not null check (status in ('confirmed','pending_clinician_review','placeholder')),
  updated_at  timestamptz not null default now()
);

-- Seed with all thresholds from the design doc
insert into clinical_config (key, value, description, status) values
  ('isi_no_insomnia_max',            '7',    'ISI upper bound for no clinical insomnia',                 'confirmed'),
  ('isi_subthreshold_max',           '14',   'ISI upper bound for subthreshold insomnia',                'confirmed'),
  ('isi_moderate_max',               '21',   'ISI upper bound for moderate insomnia',                    'confirmed'),
  ('isi_severe_max',                 '28',   'ISI upper bound for severe insomnia',                      'confirmed'),
  ('stop_bang_threshold',            '3',    'STOP-BANG score threshold for high apnea risk',            'confirmed'),
  ('ess_high_threshold',             '10',   'ESS score above which daytime sleepiness is high',         'confirmed'),
  ('phq2_positive_threshold',        '3',    'PHQ-2 total score for positive mood screen',               'pending_clinician_review'),
  ('gad2_positive_threshold',        '3',    'GAD-2 total score for positive anxiety screen',            'pending_clinician_review'),
  ('dbas16_high_threshold',          '4',    'DBAS-16 mean item score above which beliefs are high',     'pending_clinician_review'),
  ('psas_high_threshold',            '0',    'PSAS threshold — TBD by clinical advisor',                 'placeholder'),
  ('se_tier1_min',                   '80',   'SE% minimum for Tier 1 assignment',                        'pending_clinician_review'),
  ('se_expansion_trigger',           '85',   'SE% rolling average above which window expands',           'pending_clinician_review'),
  ('se_contraction_trigger',         '80',   'SE% rolling average below which window contracts',         'pending_clinician_review'),
  ('se_eval_window_nights',          '7',    'Number of nights in rolling SE average',                   'pending_clinician_review'),
  ('se_eval_frequency_days',         '7',    'How often (days) sleep window is re-evaluated',            'pending_clinician_review'),
  ('window_expansion_step_min',      '20',   'Minutes added when window expands',                        'pending_clinician_review'),
  ('compression_step_min_per_week',  '20',   'Minutes TIB reduces per week in sleep compression',       'pending_clinician_review'),
  ('tib_floor_hours',                '5.25', 'Minimum TIB in hours for restriction/compression',         'pending_clinician_review'),
  ('baseline_min_entries',           '7',    'Valid diary entries required to complete baseline',         'pending_clinician_review'),
  ('baseline_max_days',              '14',   'Maximum calendar days for baseline diary period',           'pending_clinician_review'),
  ('isi_reassess_interval_weeks',    '2',    'Weeks between ISI reassessments during full track',         'confirmed'),
  ('light_isi_reassess_weeks',       '2,4',  'Week numbers for light track ISI reassessments',            'confirmed'),
  ('isi_response_drop',              '8',    'ISI point drop required to count as treatment response',    'confirmed'),
  ('isi_remission_max',              '7',    'ISI score at or below which remission is declared',         'confirmed'),
  ('no_improvement_weeks',           '6',    'Weeks after which no-improvement escalation prompt shows', 'pending_clinician_review'),
  ('out_of_bed_wait_min',            '18',   'Minutes awake in bed before getting up (stimulus control)','pending_clinician_review'),
  ('selfharm_lockout_hours',         '24',   'Hours assessment is locked after self-harm flag',           'placeholder'),
  ('diary_valid_tib_min_hours',      '2',    'Minimum TIB hours for a diary entry to be valid',          'confirmed'),
  ('diary_valid_tib_max_hours',      '16',   'Maximum TIB hours for a diary entry to be valid',          'confirmed'),
  ('diary_valid_log_window_hours',   '36',   'Hours after night start within which entry must be logged', 'confirmed'),
  ('dormant_missed_checkins',        '3',    'Consecutive missed check-ins before plan freezes',          'confirmed');

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────
alter table profiles             enable row level security;
alter table assessment_1         enable row level security;
alter table diary_entries        enable row level security;
alter table extra_screens        enable row level security;
alter table treatment_plans      enable row level security;
alter table light_track_progress enable row level security;
alter table isi_reassessments    enable row level security;
alter table analytics_events     enable row level security;
alter table feedback             enable row level security;
alter table clinical_config      enable row level security;

-- Users can only read/write their own rows
create policy "Own profile" on profiles
  for all using (auth.uid() = id);

create policy "Own assessment" on assessment_1
  for all using (auth.uid() = user_id);

create policy "Own diary entries" on diary_entries
  for all using (auth.uid() = user_id);

create policy "Own extra screens" on extra_screens
  for all using (auth.uid() = user_id);

create policy "Own treatment plan" on treatment_plans
  for all using (auth.uid() = user_id);

create policy "Own light track" on light_track_progress
  for all using (auth.uid() = user_id);

create policy "Own ISI reassessments" on isi_reassessments
  for all using (auth.uid() = user_id);

-- Analytics: users can insert (but not read others')
create policy "Insert own analytics" on analytics_events
  for insert with check (auth.uid() = user_id or user_id is null);

-- Feedback: users can insert only
create policy "Insert own feedback" on feedback
  for insert with check (auth.uid() = user_id);

-- Clinical config: anyone authenticated can read (server-side reads use service role)
create policy "Read clinical config" on clinical_config
  for select using (auth.role() = 'authenticated');
