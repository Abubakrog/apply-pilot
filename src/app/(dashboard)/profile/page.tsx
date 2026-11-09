'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/navigation/header';
import { useApp } from '@/lib/store/app-context';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { OpportunityCategory } from '@/types/database';
import {
  UserCheck,
  GraduationCap,
  Briefcase,
  Code2,
  Trophy,
  Save,
  IdCard,
  MapPin,
  FileText,
} from 'lucide-react';

const ALL_CATEGORIES: OpportunityCategory[] = [
  'Internship',
  'Scholarship',
  'Hackathon',
  'Fellowship',
  'Job',
  'Other',
];

export default function ProfilePage() {
  const { profile, updateProfile, user } = useApp();
  const { success, error } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [university, setUniversity] = useState('');
  const [degree, setDegree] = useState('');
  const [gradYear, setGradYear] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [projects, setProjects] = useState('');
  const [workExperience, setWorkExperience] = useState('');
  const [achievements, setAchievements] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [preferredCats, setPreferredCats] = useState<OpportunityCategory[]>([]);
  const [locationsInput, setLocationsInput] = useState('');
  const [timezone, setTimezone] = useState('America/Los_Angeles');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || user?.name || '');
      setEmail(profile.email || user?.email || '');
      setUniversity(profile.university || '');
      setDegree(profile.degree || '');
      setGradYear(profile.graduation_year || '');
      setSkillsInput(profile.skills ? profile.skills.join(', ') : '');
      setProjects(profile.projects || '');
      setWorkExperience(profile.work_experience || '');
      setAchievements(profile.achievements || '');
      setResumeUrl(profile.resume_url || '');
      setPreferredCats(profile.preferred_categories || []);
      setLocationsInput(profile.preferred_locations ? profile.preferred_locations.join(', ') : '');
      setTimezone(profile.timezone || 'UTC');
    }
  }, [profile, user]);

  const handleToggleCategory = (cat: OpportunityCategory) => {
    if (preferredCats.includes(cat)) {
      setPreferredCats(preferredCats.filter((c) => c !== cat));
    } else {
      setPreferredCats([...preferredCats, cat]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const skillsArray = skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const locationsArray = locationsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await updateProfile({
        full_name: fullName.trim() || null,
        email: email.trim() || null,
        university: university.trim() || null,
        degree: degree.trim() || null,
        graduation_year: gradYear.trim() || null,
        skills: skillsArray,
        projects: projects.trim() || null,
        work_experience: workExperience.trim() || null,
        achievements: achievements.trim() || null,
        resume_url: resumeUrl.trim() || null,
        preferred_categories: preferredCats,
        preferred_locations: locationsArray,
        timezone: timezone.trim() || 'UTC',
      });

      success('Profile Vault updated! The AI assistant will now use this context.');
    } catch {
      error('Failed to update Profile Vault');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Profile Vault"
        description="Your background, used to write every draft"
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto space-y-6">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Top Banner */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <IdCard className="h-4 w-4 text-blue-600" />
                Profile vault context engine
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                Fill this once. When drafting application answers or cold emails, ApplyPilot
                pulls directly from these projects and achievements to write specific, grounded responses.
              </p>
            </div>

            <Button
              type="submit"
              loading={isSaving}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 shrink-0"
            >
              <Save className="h-4 w-4" />
              Save vault
            </Button>
          </div>

          {/* Section 1: Basic & Academic Credentials */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-4">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <GraduationCap className="h-4 w-4 text-slate-500" />
              Basic and academic background
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Full name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex Rivera"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Contact email
                </label>
                <input
                  type="email"
                  placeholder="alex.rivera@example.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  College or university
                </label>
                <input
                  type="text"
                  placeholder="e.g. Stanford University"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Degree and major
                </label>
                <input
                  type="text"
                  placeholder="e.g. B.S. in Computer Science"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Graduation year
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2027"
                  value={gradYear}
                  onChange={(e) => setGradYear(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Resume link / portfolio URL
              </label>
              <input
                type="url"
                placeholder="https://drive.google.com/... or https://alex.dev/resume.pdf"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Section 2: Skills & Technical Projects */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-4">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Code2 className="h-4 w-4 text-slate-500" />
              Technical skills and projects
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Technical Skills (comma-separated)
              </label>
              <input
                type="text"
                placeholder="e.g. TypeScript, React, Go, PostgreSQL, PyTorch, Docker, Kubernetes"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                The AI writing assistant highlights these exact matching technologies when writing answers.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Key Technical Projects (Name, Tech Stack, What you built, Metric impact)
              </label>
              <textarea
                rows={4}
                placeholder="1. Raft KV Store: Built distributed store in Go with gRPC, handling 15k req/sec with leader failover.&#10;2. Course Reviews Platform: Next.js + Postgres web app used by 4,000+ campus students."
                value={projects}
                onChange={(e) => setProjects(e.target.value)}
                className="w-full p-3 text-xs font-mono rounded-md border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600 leading-relaxed resize-y"
              />
            </div>
          </div>

          {/* Section 3: Experience & Achievements */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-4">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Briefcase className="h-4 w-4 text-slate-500" />
              Work experience and notable achievements
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Internships, Research, or Work Experience
              </label>
              <textarea
                rows={3}
                placeholder="Software Engineer Intern @ CloudScale (Summer 2025): Optimized Postgres queries reducing p99 latency by 32%, authored real-time ingestion pipelines."
                value={workExperience}
                onChange={(e) => setWorkExperience(e.target.value)}
                className="w-full p-3 text-xs rounded-md border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600 leading-relaxed resize-y"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Awards, Hackathons & Honors
              </label>
              <textarea
                rows={2}
                placeholder="1st Place CalHacks 10.0 (Developer Tools), Dean's Honor List (2024-2025), ICPC Regional Finalist"
                value={achievements}
                onChange={(e) => setAchievements(e.target.value)}
                className="w-full p-3 text-xs rounded-md border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600 leading-relaxed resize-y"
              />
            </div>
          </div>

          {/* Section 4: Preferences */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-4">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <MapPin className="h-4 w-4 text-slate-500" />
              Target opportunity preferences
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Preferred opportunity types
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_CATEGORIES.map((cat) => {
                  const isSelected = preferredCats.includes(cat);
                  return (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => handleToggleCategory(cat)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Preferred Locations (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. San Francisco, CA, New York, NY, Remote"
                  value={locationsInput}
                  onChange={(e) => setLocationsInput(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Timezone
                </label>
                <input
                  type="text"
                  placeholder="e.g. America/New_York or UTC"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              loading={isSaving}
              size="md"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 px-6"
            >
              <Save className="h-4 w-4" />
              Save profile vault
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
