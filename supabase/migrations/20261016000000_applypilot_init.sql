-- ApplyPilot Database Schema Migration
-- Designed for PostgreSQL on Supabase with Row Level Security (RLS)

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    university TEXT,
    degree TEXT,
    graduation_year TEXT,
    skills TEXT[] DEFAULT '{}'::text[],
    projects TEXT,
    work_experience TEXT,
    achievements TEXT,
    resume_url TEXT,
    preferred_categories TEXT[] DEFAULT '{}'::text[],
    preferred_locations TEXT[] DEFAULT '{}'::text[],
    timezone TEXT DEFAULT 'UTC',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 2. Create opportunities table
CREATE TABLE IF NOT EXISTS public.opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    organisation TEXT NOT NULL,
    url TEXT,
    category TEXT NOT NULL CHECK (category IN ('Internship', 'Scholarship', 'Hackathon', 'Fellowship', 'Job', 'Other')),
    description TEXT,
    eligibility TEXT,
    required_documents TEXT[] DEFAULT '{}'::text[],
    deadline TIMESTAMPTZ,
    location TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'Interested' CHECK (status IN ('Interested', 'Preparing', 'Applied', 'Interview', 'Accepted', 'Rejected', 'Withdrawn')),
    applied_date TIMESTAMPTZ,
    follow_up_date TIMESTAMPTZ,
    relevant_links JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 3. Create application_drafts table
CREATE TABLE IF NOT EXISTS public.application_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    draft_type TEXT NOT NULL CHECK (draft_type IN ('application_answer', 'cold_email', 'organiser_email', 'follow_up', 'custom')),
    subject TEXT,
    body TEXT NOT NULL,
    tone TEXT DEFAULT 'Professional',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 4. Create reminder_preferences table
CREATE TABLE IF NOT EXISTS public.reminder_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    reminder_intervals INTEGER[] DEFAULT '{7, 3, 1, 0}'::integer[],
    timezone TEXT NOT NULL DEFAULT 'UTC',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 5. Create reminder_logs table with database-backed idempotency key
CREATE TABLE IF NOT EXISTS public.reminder_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    scheduled_for TIMESTAMPTZ NOT NULL,
    reminder_type TEXT NOT NULL, -- e.g. '7_days', '3_days', '1_day', '0_days'
    sent_at TIMESTAMPTZ,
    delivery_status TEXT NOT NULL DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'failed', 'skipped')),
    error_message TEXT,
    idempotency_key TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 6. Create activity_logs table for audit trail
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_opportunities_user_id ON public.opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON public.opportunities(user_id, status);
CREATE INDEX IF NOT EXISTS idx_opportunities_deadline ON public.opportunities(user_id, deadline);
CREATE INDEX IF NOT EXISTS idx_application_drafts_opp ON public.application_drafts(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_reminder_logs_idempotency ON public.reminder_logs(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id, created_at DESC);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Profiles
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- RLS Policies: Opportunities
CREATE POLICY "Users can manage their own opportunities"
    ON public.opportunities FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS Policies: Application Drafts
CREATE POLICY "Users can manage their own application drafts"
    ON public.application_drafts FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS Policies: Reminder Preferences
CREATE POLICY "Users can manage their reminder preferences"
    ON public.reminder_preferences FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS Policies: Reminder Logs
CREATE POLICY "Users can view their own reminder logs"
    ON public.reminder_logs FOR SELECT
    USING (auth.uid() = user_id);

-- Service role can insert/update reminder logs in cron jobs
CREATE POLICY "Service role can manage reminder logs"
    ON public.reminder_logs FOR ALL
    USING (true)
    WITH CHECK (true);

-- RLS Policies: Activity Logs
CREATE POLICY "Users can view their own activity logs"
    ON public.activity_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert activity logs"
    ON public.activity_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Trigger to auto-create profile and reminder_preferences upon user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.reminder_preferences (user_id, enabled, reminder_intervals, timezone)
    VALUES (NEW.id, TRUE, '{7, 3, 1, 0}'::integer[], 'UTC')
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_opportunities_updated_at
    BEFORE UPDATE ON public.opportunities
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_application_drafts_updated_at
    BEFORE UPDATE ON public.application_drafts
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_reminder_preferences_updated_at
    BEFORE UPDATE ON public.reminder_preferences
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
