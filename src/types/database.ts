export type OpportunityCategory =
  | 'Internship'
  | 'Scholarship'
  | 'Hackathon'
  | 'Fellowship'
  | 'Job'
  | 'Other';

export type ApplicationStatus =
  | 'Interested'
  | 'Preparing'
  | 'Applied'
  | 'Interview'
  | 'Accepted'
  | 'Rejected'
  | 'Withdrawn';

export type DraftType =
  | 'application_answer'
  | 'cold_email'
  | 'organiser_email'
  | 'follow_up'
  | 'custom';

export interface RelevantLink {
  title: string;
  url: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  university: string | null;
  degree: string | null;
  graduation_year: string | null;
  skills: string[];
  projects: string | null;
  work_experience: string | null;
  achievements: string | null;
  resume_url: string | null;
  preferred_categories: OpportunityCategory[];
  preferred_locations: string[];
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface Opportunity {
  id: string;
  user_id: string;
  title: string;
  organisation: string;
  url: string | null;
  category: OpportunityCategory;
  description: string | null;
  eligibility: string | null;
  required_documents: string[];
  deadline: string | null;
  location: string | null;
  notes: string | null;
  status: ApplicationStatus;
  applied_date: string | null;
  follow_up_date: string | null;
  relevant_links: RelevantLink[];
  created_at: string;
  updated_at: string;
}

export interface ApplicationDraft {
  id: string;
  user_id: string;
  opportunity_id: string;
  draft_type: DraftType;
  subject: string | null;
  body: string;
  tone: string;
  created_at: string;
  updated_at: string;
}

export interface ReminderPreference {
  id: string;
  user_id: string;
  enabled: boolean;
  reminder_intervals: number[];
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface ReminderLog {
  id: string;
  user_id: string;
  opportunity_id: string;
  scheduled_for: string;
  reminder_type: string;
  sent_at: string | null;
  delivery_status: 'pending' | 'sent' | 'failed' | 'skipped';
  error_message: string | null;
  idempotency_key: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  opportunity_id: string | null;
  action_type: string;
  description: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface DashboardStats {
  totalOpportunities: number;
  submittedApplications: number;
  upcomingDeadlines: number;
  awaitingFollowUp: number;
}
