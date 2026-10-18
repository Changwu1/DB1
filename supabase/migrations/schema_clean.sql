create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null,
  timezone text not null default 'Asia/Bangkok',
  consent_version text,
  consent_at timestamptz,
  disclaimer_acknowledged_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_updated_at before update on profiles for each row execute function set_updated_at();

create table assessment_1 (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references profiles(id) on delete cascade,
  isi_score int check (isi_score between 0 and 28),
  severity_label text check (severity_label in ('none','subthreshold','moderate','severe')),
  insomnia_type text check (insomnia_type in ('onset','maintenance','early_morning','mixed')),
  duration_label text check (duration_label in ('acute','chronic')),
  selfharm_flag_raised boolean not null default false,
  selfharm_flagged_at timestamptz,
  red_flags text[] not null default '{}',
  cleared_flags text[] not null default '{}',
  clearance_attested_at timestamptz,
  contraindications text[] not null default '{}',
  routing_decision text check (routing_decision in ('tips_only','jinx_light_track','jinx_full_track','referral_gated','circadian_not_supported_v1','crisis_stop')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger assessment_1_updated_at before update on assessment_1 for each row execute function set_updated_at();

create table diary_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  night_date date not null,
  phase text not null check (phase in ('baseline','baseline_restart','treatment','light_track','maintenance')),
  baseline_attempt int not null default 1,
  time_into_bed timestamptz not null,
  time_out_of_bed timestamptz not null,
  sol_minutes int not null check (sol_minutes >= 0),
  waso_minutes int not null check (waso_minutes >= 0),
  quality_rating int not null check (quality_rating between 1 and 5),
  tib_minutes int not null,
  tst_minutes int not null,
  se_percent numeric(5,2) not null,
  is_valid boolean not null default false,
  invalid_reason text,
  logged_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, night_date, phase, baseline_attempt)
);

create table extra_screens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references profiles(id) on delete cascade,
  ess_score int check (ess_score between 0 and 24),
  dbas_mean_score numeric(4,2),
  psas_score int,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table treatment_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references profiles(id) on delete cascade,
  assigned_tier int not null check (assigned_tier in (1,2,3)),
  avg_se_at_tiering numeric(5,2),
  avg_sol_at_tiering int,
  avg_waso_at_tiering int,
  avg_tst_at_tiering int,
  ess_score_at_tiering int,
  dbas_mean_at_tiering numeric(4,2),
  psas_score_at_tiering int,
  prescribed_initial_sleep_window_min int,
  current_sleep_window_min int,
  prescribed_wake_time time,
  prescribed_bed_time time,
  treatment_started_at timestamptz,
  current_week int not null default 1,
  plan_frozen boolean not null default false,
  plan_frozen_at timestamptz,
  consecutive_missed_checkins int not null default 0,
  last_checkin_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger treatment_plans_updated_at before update on treatment_plans for each row execute function set_updated_at();

create table light_track_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references profiles(id) on delete cascade,
  started_at timestamptz not null default now(),
  current_week int not null default 1,
  last_checkin_at timestamptz,
  isi_week2_score int check (isi_week2_score between 0 and 28),
  isi_week2_at timestamptz,
  isi_week4_score int check (isi_week4_score between 0 and 28),
  isi_week4_at timestamptz,
  completed_at timestamptz,
  outcome text check (outcome in ('remission','continue','escalated_to_full')),
  plan_frozen boolean not null default false,
  plan_frozen_at timestamptz,
  consecutive_missed_checkins int not null default 0,
  last_checkin_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger light_track_progress_updated_at before update on light_track_progress for each row execute function set_updated_at();

create table isi_reassessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  score int not null check (score between 0 and 28),
  baseline_score int,
  week_number int not null,
  track text not null check (track in ('light','full')),
  assessed_at timestamptz not null default now()
);

create table analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  event_name text not null,
  metadata jsonb not null default '{}',
  page_context text,
  created_at timestamptz not null default now()
);

create table feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  text text not null,
  page_context text,
  created_at timestamptz not null default now()
);

create table clinical_config (
  key text primary key,
  value text not null,
  description text,
  status text not null check (status in ('confirmed','pending_clinician_review','placeholder')),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;
alter table assessment_1 enable row level security;
alter table diary_entries enable row level security;
alter table extra_screens enable row level security;
alter table treatment_plans enable row level security;
alter table light_track_progress enable row level security;
alter table isi_reassessments enable row level security;
alter table analytics_events enable row level security;
alter table feedback enable row level security;
alter table clinical_config enable row level security;

create policy "Own profile" on profiles for all using (auth.uid() = id);
create policy "Own assessment" on assessment_1 for all using (auth.uid() = user_id);
create policy "Own diary entries" on diary_entries for all using (auth.uid() = user_id);
create policy "Own extra screens" on extra_screens for all using (auth.uid() = user_id);
create policy "Own treatment plan" on treatment_plans for all using (auth.uid() = user_id);
create policy "Own light track" on light_track_progress for all using (auth.uid() = user_id);
create policy "Own ISI reassessments" on isi_reassessments for all using (auth.uid() = user_id);
create policy "Insert own analytics" on analytics_events for insert with check (auth.uid() = user_id or user_id is null);
create policy "Insert own feedback" on feedback for insert with check (auth.uid() = user_id);
create policy "Read clinical config" on clinical_config for select using (auth.role() = 'authenticated');
