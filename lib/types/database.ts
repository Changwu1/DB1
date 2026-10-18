// Hand-written until Supabase CLI generates them.
// Run: npx supabase gen types typescript --project-id <id> > lib/types/database.ts
// to replace this file once the project is linked.

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type RoutingDecision =
  | "tips_only"
  | "jinx_light_track"
  | "jinx_full_track"
  | "referral_gated"
  | "circadian_not_supported_v1"
  | "crisis_stop";

export type DiaryPhase = "baseline" | "baseline_restart" | "treatment" | "light_track" | "maintenance";
export type InsomniaSeverity = "none" | "subthreshold" | "moderate" | "severe";
export type InsomniaType = "onset" | "maintenance" | "early_morning" | "mixed";
export type DurationLabel = "acute" | "chronic";
export type Track = "light" | "full";
export type LightTrackOutcome = "remission" | "continue" | "escalated_to_full";
export type ConfigStatus = "confirmed" | "pending_clinician_review" | "placeholder";

// ── Table row types ──────────────────────────────────────────────────────────

export type Profile = {
  id: string;
  nickname: string;
  timezone: string;
  consent_version: string | null;
  consent_at: string | null;
  disclaimer_acknowledged_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Assessment1 = {
  id: string;
  user_id: string;
  isi_score: number | null;
  severity_label: InsomniaSeverity | null;
  insomnia_type: InsomniaType | null;
  duration_label: DurationLabel | null;
  selfharm_flag_raised: boolean;
  selfharm_flagged_at: string | null;
  red_flags: string[];
  cleared_flags: string[];
  clearance_attested_at: string | null;
  contraindications: string[];
  routing_decision: RoutingDecision | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DiaryEntry = {
  id: string;
  user_id: string;
  night_date: string;
  phase: DiaryPhase;
  baseline_attempt: number;
  time_into_bed: string;
  time_out_of_bed: string;
  sol_minutes: number;
  waso_minutes: number;
  quality_rating: number;
  tib_minutes: number;
  tst_minutes: number;
  se_percent: number;
  is_valid: boolean;
  invalid_reason: string | null;
  logged_at: string;
  created_at: string;
};

export type ExtraScreens = {
  id: string;
  user_id: string;
  ess_score: number | null;
  dbas_mean_score: number | null;
  psas_score: number | null;
  completed_at: string | null;
  created_at: string;
};

export type TreatmentPlan = {
  id: string;
  user_id: string;
  assigned_tier: 1 | 2 | 3;
  avg_se_at_tiering: number | null;
  avg_sol_at_tiering: number | null;
  avg_waso_at_tiering: number | null;
  avg_tst_at_tiering: number | null;
  ess_score_at_tiering: number | null;
  dbas_mean_at_tiering: number | null;
  psas_score_at_tiering: number | null;
  prescribed_initial_sleep_window_min: number | null;
  current_sleep_window_min: number | null;
  prescribed_wake_time: string | null;
  prescribed_bed_time: string | null;
  treatment_started_at: string | null;
  current_week: number;
  plan_frozen: boolean;
  plan_frozen_at: string | null;
  consecutive_missed_checkins: number;
  last_checkin_date: string | null;
  created_at: string;
  updated_at: string;
};

export type LightTrackProgress = {
  id: string;
  user_id: string;
  started_at: string;
  current_week: number;
  last_checkin_at: string | null;
  isi_week2_score: number | null;
  isi_week2_at: string | null;
  isi_week4_score: number | null;
  isi_week4_at: string | null;
  completed_at: string | null;
  outcome: LightTrackOutcome | null;
  plan_frozen: boolean;
  plan_frozen_at: string | null;
  consecutive_missed_checkins: number;
  last_checkin_date: string | null;
  created_at: string;
  updated_at: string;
};

export type IsiReassessment = {
  id: string;
  user_id: string;
  score: number;
  baseline_score: number | null;
  week_number: number;
  track: Track;
  assessed_at: string;
};

export type AnalyticsEvent = {
  id: string;
  user_id: string | null;
  event_name: string;
  metadata: Json;
  page_context: string | null;
  created_at: string;
};

export type Feedback = {
  id: string;
  user_id: string | null;
  text: string;
  page_context: string | null;
  created_at: string;
};

export type ClinicalConfig = {
  key: string;
  value: string;
  description: string | null;
  status: ConfigStatus;
  updated_at: string;
};

// ── Supabase Database type ───────────────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          nickname: string;
          timezone?: string;
          consent_version?: string | null;
          consent_at?: string | null;
          disclaimer_acknowledged_at?: string | null;
        };
        Update: {
          nickname?: string;
          timezone?: string;
          consent_version?: string | null;
          consent_at?: string | null;
          disclaimer_acknowledged_at?: string | null;
        };
        Relationships: never[];
      };
      assessment_1: {
        Row: Assessment1;
        Insert: {
          user_id: string;
          isi_score?: number | null;
          severity_label?: InsomniaSeverity | null;
          insomnia_type?: InsomniaType | null;
          duration_label?: DurationLabel | null;
          selfharm_flag_raised?: boolean;
          selfharm_flagged_at?: string | null;
          red_flags?: string[];
          cleared_flags?: string[];
          clearance_attested_at?: string | null;
          contraindications?: string[];
          routing_decision?: RoutingDecision | null;
          completed_at?: string | null;
        };
        Update: {
          isi_score?: number | null;
          severity_label?: InsomniaSeverity | null;
          insomnia_type?: InsomniaType | null;
          duration_label?: DurationLabel | null;
          selfharm_flag_raised?: boolean;
          selfharm_flagged_at?: string | null;
          red_flags?: string[];
          cleared_flags?: string[];
          clearance_attested_at?: string | null;
          contraindications?: string[];
          routing_decision?: RoutingDecision | null;
          completed_at?: string | null;
        };
        Relationships: never[];
      };
      diary_entries: {
        Row: DiaryEntry;
        Insert: {
          user_id: string;
          night_date: string;
          phase: DiaryPhase;
          baseline_attempt?: number;
          time_into_bed: string;
          time_out_of_bed: string;
          sol_minutes: number;
          waso_minutes: number;
          quality_rating: number;
          tib_minutes: number;
          tst_minutes: number;
          se_percent: number;
          is_valid: boolean;
          invalid_reason?: string | null;
          logged_at?: string;
        };
        Update: {
          is_valid?: boolean;
          invalid_reason?: string | null;
        };
        Relationships: never[];
      };
      extra_screens: {
        Row: ExtraScreens;
        Insert: {
          user_id: string;
          ess_score?: number | null;
          dbas_mean_score?: number | null;
          psas_score?: number | null;
          completed_at?: string | null;
        };
        Update: {
          ess_score?: number | null;
          dbas_mean_score?: number | null;
          psas_score?: number | null;
          completed_at?: string | null;
        };
        Relationships: never[];
      };
      treatment_plans: {
        Row: TreatmentPlan;
        Insert: {
          user_id: string;
          assigned_tier: 1 | 2 | 3;
          avg_se_at_tiering?: number | null;
          avg_sol_at_tiering?: number | null;
          avg_waso_at_tiering?: number | null;
          avg_tst_at_tiering?: number | null;
          ess_score_at_tiering?: number | null;
          dbas_mean_at_tiering?: number | null;
          psas_score_at_tiering?: number | null;
          prescribed_initial_sleep_window_min?: number | null;
          current_sleep_window_min?: number | null;
          prescribed_wake_time?: string | null;
          prescribed_bed_time?: string | null;
          treatment_started_at?: string | null;
          current_week?: number;
          plan_frozen?: boolean;
          plan_frozen_at?: string | null;
          consecutive_missed_checkins?: number;
          last_checkin_date?: string | null;
        };
        Update: {
          current_sleep_window_min?: number | null;
          prescribed_wake_time?: string | null;
          prescribed_bed_time?: string | null;
          treatment_started_at?: string | null;
          current_week?: number;
          plan_frozen?: boolean;
          plan_frozen_at?: string | null;
          consecutive_missed_checkins?: number;
          last_checkin_date?: string | null;
        };
        Relationships: never[];
      };
      light_track_progress: {
        Row: LightTrackProgress;
        Insert: {
          user_id: string;
          started_at?: string;
          current_week?: number;
          last_checkin_at?: string | null;
          isi_week2_score?: number | null;
          isi_week2_at?: string | null;
          isi_week4_score?: number | null;
          isi_week4_at?: string | null;
          completed_at?: string | null;
          outcome?: LightTrackOutcome | null;
          plan_frozen?: boolean;
          consecutive_missed_checkins?: number;
          last_checkin_date?: string | null;
        };
        Update: {
          current_week?: number;
          last_checkin_at?: string | null;
          isi_week2_score?: number | null;
          isi_week2_at?: string | null;
          isi_week4_score?: number | null;
          isi_week4_at?: string | null;
          completed_at?: string | null;
          outcome?: LightTrackOutcome | null;
          plan_frozen?: boolean;
          plan_frozen_at?: string | null;
          consecutive_missed_checkins?: number;
          last_checkin_date?: string | null;
        };
        Relationships: never[];
      };
      isi_reassessments: {
        Row: IsiReassessment;
        Insert: {
          user_id: string;
          score: number;
          baseline_score?: number | null;
          week_number: number;
          track: Track;
          assessed_at?: string;
        };
        Update: never;
        Relationships: never[];
      };
      analytics_events: {
        Row: AnalyticsEvent;
        Insert: {
          user_id?: string | null;
          event_name: string;
          metadata?: Json;
          page_context?: string | null;
        };
        Update: never;
        Relationships: never[];
      };
      feedback: {
        Row: Feedback;
        Insert: {
          user_id?: string | null;
          text: string;
          page_context?: string | null;
        };
        Update: never;
        Relationships: never[];
      };
      clinical_config: {
        Row: ClinicalConfig;
        Insert: {
          key: string;
          value: string;
          description?: string | null;
          status: ConfigStatus;
          updated_at?: string;
        };
        Update: {
          value?: string;
          description?: string | null;
          status?: ConfigStatus;
          updated_at?: string;
        };
        Relationships: never[];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
