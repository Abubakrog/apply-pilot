# ApplyPilot — AI-Powered Application Tracker

> **Your opportunities. Organised. Never missed.**

ApplyPilot is a modern, full-stack application tracker designed for students and job seekers to manage internships, scholarships, hackathons, fellowships, and jobs in one centralized system. 

Built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, **Supabase (Auth, PostgreSQL & Row Level Security)**, **Google Gemini 3.8 Flash**, and **Resend**.

---

## Key Features

1. **Information-Dense SaaS Dashboard**
   - Live metrics: Total opportunities saved, applications submitted, upcoming deadlines, applications awaiting follow-up.
   - Urgent deadlines list sorted chronologically with dynamic days-remaining urgency badges.
   - Real-time application activity timeline.

2. **Dual Viewing Modes: Table & Kanban Pipeline**
   - **Table View**: Sortable by upcoming deadline or date added, searchable by title/organisation/location, filterable by category and status.
   - **Kanban Board**: Linear-style status columns (`Interested`, `Preparing`, `Applied`, `Interview`, `Accepted`, `Rejected`) with quick status progressions.

3. **URL Extraction with SSRF Protection**
   - Paste any opportunity posting URL to extract title, organisation, category, requirements, eligibility, and deadline.
   - **Security**: Validates protocols, performs DNS lookups to block private/local/internal IP ranges (SSRF defense), enforces size and timeout caps, and parses text without code execution.
   - **Human-in-the-loop**: Extracted data is presented in a review form so the user can verify or adjust details before saving.

4. **Personal Profile Vault & Grounded AI Writing Assistant**
   - Store your university, degree, graduating class, technical skills, key projects (with metrics), work experience, and achievements once.
   - The AI Writing Assistant (powered server-side by Gemini 3.8 Flash) uses your Profile Vault to write tailored:
     - Cold emails to recruiters
     - Answers to application essay questions ("Why us", "Describe a challenging project")
     - Organiser / sponsor inquiries for hackathons and scholarships
     - Polite follow-up emails
   - Multi-tone selector (Professional, Enthusiastic, Confident, Direct), in-place editing, one-click clipboard copying, and draft saving history.

5. **Automated Transactional Deadline Reminders (Resend)**
   - Configurable schedules (7 days, 3 days, 1 day, and Day of deadline).
   - Database-backed idempotency keys in `reminder_logs` to prevent duplicate emails.
   - Automatically skips opportunities that have already been applied to, accepted, or withdrawn.
   - Interactive "Send Test Reminder" button in Settings to verify Resend API integration.
   - Ready for automated cron execution (`/api/cron/reminders`) via Supabase Cron, pg_net, or Vercel Cron.

6. **PostgreSQL Row Level Security (RLS)**
   - Strict data isolation ensuring users can only view, edit, and delete their own profiles, opportunities, drafts, and preferences.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | **Next.js 16** (App Router, Turbopack, Partial Prerendering) |
| Language | **TypeScript 5** |
| Styling | **Tailwind CSS v4** |
| Database & Auth | **Supabase** (PostgreSQL + RLS, GoTrue Auth) |
| AI / LLM | **Google Gemini 3.8 Flash** via `@google/genai` |
| Email Delivery | **Resend** |
| Icons | **Lucide React** |

---

## Project Structure

```
apply-pilot/
├── supabase/
│   └── migrations/
│       └── 20261016000000_applypilot_init.sql   # Full PostgreSQL schema, RLS & triggers
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx                  # Supabase login & demo access
│   │   │   ├── signup/page.tsx                 # Supabase registration & verification
│   │   │   └── forgot-password/page.tsx        # Password reset
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx                      # Dashboard shell & sidebar
│   │   │   ├── dashboard/page.tsx              # Main dashboard overview
│   │   │   ├── opportunities/
│   │   │   │   ├── page.tsx                    # Table & Kanban view
│   │   │   │   └── [id]/page.tsx               # Opportunity details & AI assistant
│   │   │   ├── profile/page.tsx                # Personal Profile Vault
│   │   │   └── settings/page.tsx               # Reminders, cron diagnostics & test dispatch
│   │   ├── api/
│   │   │   ├── ai/draft/route.ts               # Gemini 3.8 Flash drafting API
│   │   │   ├── cron/reminders/route.ts         # Idempotent deadline reminder cron
│   │   │   ├── extract/route.ts                # SSRF-protected URL extraction API
│   │   │   └── reminders/test/route.ts         # Resend test email dispatcher
│   │   ├── layout.tsx                          # Root layout with Providers
│   │   └── page.tsx                            # Linear-style public landing page
│   ├── components/
│   │   ├── ai/writing-assistant.tsx            # AI drafting modal/panel
│   │   ├── dashboard/                          # Stats, upcoming deadlines, activity feed
│   │   ├── navigation/                         # Sidebar and responsive header
│   │   ├── opportunities/                      # Table, Kanban, Badges, Add modal
│   │   └── ui/                                 # Button, Badge, Modal, Toast
│   ├── lib/
│   │   ├── email/resend.ts                     # Resend email templates & client
│   │   ├── store/                              # DataService & AppContext
│   │   ├── supabase/                           # Supabase SSR, client, and admin
│   │   ├── seed-data.ts                        # Realistic seed opportunities
│   │   └── utils.ts                            # Utilities & date calculations
│   └── proxy.ts                                # Next.js 16 Proxy for session & route guards
├── .env.example                                # Environment variable documentation
└── package.json
```

---

## Getting Started

### 1. Prerequisites
- Node.js 18+ (tested on Node.js 24)
- npm or pnpm

### 2. Clone and Install Dependencies
```bash
git clone https://github.com/your-username/apply-pilot.git
cd apply-pilot
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your service credentials:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 1. Supabase (https://supabase.com)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# 2. Google Gemini API (https://aistudio.google.com/)
GEMINI_API_KEY=your-gemini-api-key

# 3. Resend (https://resend.com)
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL="ApplyPilot <onboarding@resend.dev>"

# 4. Cron Security
CRON_SECRET=your-random-cron-secret-string
```

> **Note on Local Exploration:** If you start the app without setting API credentials, ApplyPilot automatically runs in a local demonstration mode with preloaded student opportunities (KP Fellows, Cloudflare, HackMIT, etc.). You can test the full UI, Table/Kanban views, and profile vault immediately.

---

## Supabase Database Setup

1. Create a new Supabase project at [database.new](https://database.new).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open `supabase/migrations/20261016000000_applypilot_init.sql`.
4. Copy and paste the entire script into the SQL Editor and click **Run**.
5. This script creates:
   - `profiles` table with automatic signup trigger
   - `opportunities` table with category & status constraints
   - `application_drafts` table
   - `reminder_preferences` table
   - `reminder_logs` table with unique `idempotency_key`
   - `activity_logs` audit table
   - Row Level Security (RLS) policies for user data isolation
   - Trigger to sync user creation to profile and default reminder preferences

---

## Scheduled Deadline Reminders (Cron Setup)

The deadline reminder endpoint is located at `/api/cron/reminders`. It processes active opportunities, checks user intervals (e.g. 7, 3, 1, 0 days), verifies idempotency in `reminder_logs`, and dispatches emails via Resend.

### Option A: Supabase `pg_cron` & `pg_net`
Run this in the Supabase SQL editor:
```sql
-- Enable pg_cron and pg_net extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule daily reminder run at 08:00 UTC
SELECT cron.schedule(
    'daily-applypilot-reminders',
    '0 8 * * *',
    $$
    SELECT net.http_get(
        url := 'https://your-deployed-domain.com/api/cron/reminders',
        headers := jsonb_build_object(
            'Authorization', 'Bearer ' || 'your-random-cron-secret-string'
        )
    );
    $$
);
```

### Option B: Vercel Cron
Add a `vercel.json` file in the root directory:
```json
{
  "crons": [
    {
      "path": "/api/cron/reminders",
      "schedule": "0 8 * * *"
    }
  ]
}
```

### Option C: Manual or GitHub Actions Trigger
```bash
curl -X POST https://your-domain.com/api/cron/reminders \
  -H "Authorization: Bearer your-random-cron-secret-string"
```

---

## Testing & Quality Assurance

- **Build Check:**
  ```bash
  npm run build
  ```
- **Run Local Server:**
  ```bash
  npm run dev
  ```
  Visit [http://localhost:3000](http://localhost:3000).

---

## Deployment (Vercel)

1. Push your repository to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. Add the environment variables from `.env.local` to the Vercel project settings.
4. Deploy!

---

## License

MIT License. Built for students navigating recruiting seasons.
