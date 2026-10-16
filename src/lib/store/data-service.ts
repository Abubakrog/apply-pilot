import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import {
  Opportunity,
  Profile,
  ApplicationDraft,
  ReminderPreference,
  ActivityLog,
  ApplicationStatus,
} from '@/types/database';
import { INITIAL_SEED_OPPORTUNITIES, INITIAL_SEED_PROFILE } from '@/lib/seed-data';

const STORAGE_KEYS = {
  OPPORTUNITIES: 'applypilot_local_opportunities',
  PROFILE: 'applypilot_local_profile',
  DRAFTS: 'applypilot_local_drafts',
  REMINDERS: 'applypilot_local_reminders',
  ACTIVITIES: 'applypilot_local_activities',
};

// Local storage helpers
function getLocalItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error saving to localStorage', e);
  }
}

export const DataService = {
  // Profiles
  async getProfile(userId?: string): Promise<Profile | null> {
    if (!isSupabaseConfigured() || !userId) {
      return getLocalItem<Profile>(STORAGE_KEYS.PROFILE, INITIAL_SEED_PROFILE);
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Record doesn't exist yet, return seed or empty
        return null;
      }
      if (error) throw error;
      return data as Profile;
    } catch {
      return getLocalItem<Profile>(STORAGE_KEYS.PROFILE, INITIAL_SEED_PROFILE);
    }
  },

  async updateProfile(userId: string, profile: Partial<Profile>): Promise<Profile> {
    if (!isSupabaseConfigured() || userId === 'demo-user-123') {
      const current = getLocalItem<Profile>(STORAGE_KEYS.PROFILE, INITIAL_SEED_PROFILE);
      const updated = {
        ...current,
        ...profile,
        updated_at: new Date().toISOString(),
      };
      setLocalItem(STORAGE_KEYS.PROFILE, updated);
      return updated;
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        ...profile,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as Profile;
  },

  // Opportunities
  async getOpportunities(userId?: string): Promise<Opportunity[]> {
    if (!isSupabaseConfigured() || !userId || userId === 'demo-user-123') {
      return getLocalItem<Opportunity[]>(
        STORAGE_KEYS.OPPORTUNITIES,
        INITIAL_SEED_OPPORTUNITIES
      );
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Opportunity[];
    } catch {
      return getLocalItem<Opportunity[]>(
        STORAGE_KEYS.OPPORTUNITIES,
        INITIAL_SEED_OPPORTUNITIES
      );
    }
  },

  async getOpportunity(id: string): Promise<Opportunity | null> {
    if (!isSupabaseConfigured()) {
      const list = getLocalItem<Opportunity[]>(
        STORAGE_KEYS.OPPORTUNITIES,
        INITIAL_SEED_OPPORTUNITIES
      );
      return list.find((o) => o.id === id) || null;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        // Fallback to local
        const list = getLocalItem<Opportunity[]>(
          STORAGE_KEYS.OPPORTUNITIES,
          INITIAL_SEED_OPPORTUNITIES
        );
        return list.find((o) => o.id === id) || null;
      }
      return data as Opportunity;
    } catch {
      const list = getLocalItem<Opportunity[]>(
        STORAGE_KEYS.OPPORTUNITIES,
        INITIAL_SEED_OPPORTUNITIES
      );
      return list.find((o) => o.id === id) || null;
    }
  },

  async createOpportunity(
    opp: Omit<Opportunity, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Opportunity> {
    const isLocal = !isSupabaseConfigured() || opp.user_id === 'demo-user-123';

    if (isLocal) {
      const list = getLocalItem<Opportunity[]>(
        STORAGE_KEYS.OPPORTUNITIES,
        INITIAL_SEED_OPPORTUNITIES
      );
      const newOpp: Opportunity = {
        ...opp,
        id: `opp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const updatedList = [newOpp, ...list];
      setLocalItem(STORAGE_KEYS.OPPORTUNITIES, updatedList);

      // Log activity
      await this.logActivity(
        opp.user_id,
        newOpp.id,
        'created',
        `Saved new ${opp.category.toLowerCase()} opportunity: "${opp.title}" at ${opp.organisation}`
      );

      return newOpp;
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('opportunities')
      .insert([opp])
      .select()
      .single();

    if (error) throw error;

    await this.logActivity(
      opp.user_id,
      data.id,
      'created',
      `Saved new ${opp.category.toLowerCase()} opportunity: "${opp.title}" at ${opp.organisation}`
    );

    return data as Opportunity;
  },

  async updateOpportunity(
    id: string,
    updates: Partial<Opportunity>
  ): Promise<Opportunity> {
    const isLocal = !isSupabaseConfigured();

    if (isLocal) {
      const list = getLocalItem<Opportunity[]>(
        STORAGE_KEYS.OPPORTUNITIES,
        INITIAL_SEED_OPPORTUNITIES
      );
      const index = list.findIndex((o) => o.id === id);
      if (index === -1) throw new Error('Opportunity not found');

      const oldStatus = list[index].status;
      const updated: Opportunity = {
        ...list[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      list[index] = updated;
      setLocalItem(STORAGE_KEYS.OPPORTUNITIES, list);

      if (updates.status && updates.status !== oldStatus) {
        await this.logActivity(
          updated.user_id,
          id,
          'status_changed',
          `Updated status from ${oldStatus} to ${updates.status}`
        );
      }

      return updated;
    }

    const supabase = createClient();
    const { data: current } = await supabase
      .from('opportunities')
      .select('status, user_id')
      .eq('id', id)
      .single();

    const { data, error } = await supabase
      .from('opportunities')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (current && updates.status && updates.status !== current.status) {
      await this.logActivity(
        current.user_id,
        id,
        'status_changed',
        `Updated status from ${current.status} to ${updates.status}`
      );
    }

    return data as Opportunity;
  },

  async deleteOpportunity(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      const list = getLocalItem<Opportunity[]>(
        STORAGE_KEYS.OPPORTUNITIES,
        INITIAL_SEED_OPPORTUNITIES
      );
      const filtered = list.filter((o) => o.id !== id);
      setLocalItem(STORAGE_KEYS.OPPORTUNITIES, filtered);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from('opportunities').delete().eq('id', id);
    if (error) throw error;
  },

  // Drafts
  async getDrafts(opportunityId: string): Promise<ApplicationDraft[]> {
    if (!isSupabaseConfigured()) {
      const allDrafts = getLocalItem<ApplicationDraft[]>(STORAGE_KEYS.DRAFTS, []);
      return allDrafts.filter((d) => d.opportunity_id === opportunityId);
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('application_drafts')
        .select('*')
        .eq('opportunity_id', opportunityId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as ApplicationDraft[];
    } catch {
      const allDrafts = getLocalItem<ApplicationDraft[]>(STORAGE_KEYS.DRAFTS, []);
      return allDrafts.filter((d) => d.opportunity_id === opportunityId);
    }
  },

  async saveDraft(
    draft: Omit<ApplicationDraft, 'id' | 'created_at' | 'updated_at'>
  ): Promise<ApplicationDraft> {
    if (!isSupabaseConfigured() || draft.user_id === 'demo-user-123') {
      const allDrafts = getLocalItem<ApplicationDraft[]>(STORAGE_KEYS.DRAFTS, []);
      const newDraft: ApplicationDraft = {
        ...draft,
        id: `draft_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setLocalItem(STORAGE_KEYS.DRAFTS, [newDraft, ...allDrafts]);

      await this.logActivity(
        draft.user_id,
        draft.opportunity_id,
        'draft_saved',
        `Generated and saved ${draft.draft_type.replace('_', ' ')} draft`
      );

      return newDraft;
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('application_drafts')
      .insert([draft])
      .select()
      .single();

    if (error) throw error;

    await this.logActivity(
      draft.user_id,
      draft.opportunity_id,
      'draft_saved',
      `Generated and saved ${draft.draft_type.replace('_', ' ')} draft`
    );

    return data as ApplicationDraft;
  },

  // Reminders
  async getReminderPreferences(userId: string): Promise<ReminderPreference> {
    const defaultPrefs: ReminderPreference = {
      id: `pref-${userId}`,
      user_id: userId,
      enabled: true,
      reminder_intervals: [7, 3, 1, 0],
      timezone: 'UTC',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (!isSupabaseConfigured() || userId === 'demo-user-123') {
      return getLocalItem<ReminderPreference>(STORAGE_KEYS.REMINDERS, defaultPrefs);
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('reminder_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        return defaultPrefs;
      }
      if (error) throw error;
      return data as ReminderPreference;
    } catch {
      return defaultPrefs;
    }
  },

  async updateReminderPreferences(
    userId: string,
    prefs: Partial<ReminderPreference>
  ): Promise<ReminderPreference> {
    if (!isSupabaseConfigured() || userId === 'demo-user-123') {
      const current = await this.getReminderPreferences(userId);
      const updated = {
        ...current,
        ...prefs,
        updated_at: new Date().toISOString(),
      };
      setLocalItem(STORAGE_KEYS.REMINDERS, updated);
      return updated;
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('reminder_preferences')
      .upsert({
        user_id: userId,
        ...prefs,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as ReminderPreference;
  },

  // Activity Logs
  async getActivityLogs(userId: string, limit = 10): Promise<ActivityLog[]> {
    const defaultActivities: ActivityLog[] = [
      {
        id: 'act-1',
        user_id: userId,
        opportunity_id: 'opp-1',
        action_type: 'status_changed',
        description: 'Moved Kleiner Perkins Fellowship to "Preparing"',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
      {
        id: 'act-2',
        user_id: userId,
        opportunity_id: 'opp-3',
        action_type: 'status_changed',
        description: 'Submitted application for HackMIT 2026',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      },
      {
        id: 'act-3',
        user_id: userId,
        opportunity_id: 'opp-5',
        action_type: 'status_changed',
        description: 'Scheduled first round interview with Anthropic',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
      },
    ];

    if (!isSupabaseConfigured() || userId === 'demo-user-123') {
      const logs = getLocalItem<ActivityLog[]>(STORAGE_KEYS.ACTIVITIES, defaultActivities);
      return logs.slice(0, limit);
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as ActivityLog[];
    } catch {
      return defaultActivities;
    }
  },

  async logActivity(
    userId: string,
    opportunityId: string | null,
    actionType: string,
    description: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const newLog: ActivityLog = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      opportunity_id: opportunityId,
      action_type: actionType,
      description,
      metadata,
      created_at: new Date().toISOString(),
    };

    if (!isSupabaseConfigured() || userId === 'demo-user-123') {
      const logs = getLocalItem<ActivityLog[]>(STORAGE_KEYS.ACTIVITIES, []);
      setLocalItem(STORAGE_KEYS.ACTIVITIES, [newLog, ...logs].slice(0, 50));
      return;
    }

    try {
      const supabase = createClient();
      await supabase.from('activity_logs').insert([
        {
          user_id: userId,
          opportunity_id: opportunityId,
          action_type: actionType,
          description,
          metadata: metadata || {},
        },
      ]);
    } catch (e) {
      console.error('Failed to log activity to Supabase', e);
    }
  },

  // Reset demo data helper
  resetDemoData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.OPPORTUNITIES);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.DRAFTS);
    localStorage.removeItem(STORAGE_KEYS.REMINDERS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
  },
};
