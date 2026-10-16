'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import {
  Opportunity,
  Profile,
  ActivityLog,
  DashboardStats,
  ApplicationStatus,
} from '@/types/database';
import { DataService } from './data-service';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { createClient } from '@/lib/supabase/client';
import { INITIAL_SEED_PROFILE } from '@/lib/seed-data';
import { useCurrentDate } from '@/lib/utils';

interface AppContextType {
  user: { id: string; email: string; name?: string } | null;
  loading: boolean;
  isDemoMode: boolean;
  isSupabaseReady: boolean;
  profile: Profile | null;
  opportunities: Opportunity[];
  activities: ActivityLog[];
  stats: DashboardStats;
  refreshData: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  addOpportunity: (
    data: Omit<Opportunity, 'id' | 'created_at' | 'updated_at' | 'user_id'>
  ) => Promise<Opportunity>;
  updateOpportunity: (id: string, updates: Partial<Opportunity>) => Promise<Opportunity>;
  deleteOpportunity: (id: string) => Promise<void>;
  resetToSeedData: () => void;
  signOut: () => Promise<void>;
  enterDemoMode: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string; name?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  const isSupabaseReady = isSupabaseConfigured();

  const loadUserData = useCallback(async (currentUserId: string) => {
    try {
      const [userProfile, userOpps, userActs] = await Promise.all([
        DataService.getProfile(currentUserId),
        DataService.getOpportunities(currentUserId),
        DataService.getActivityLogs(currentUserId),
      ]);
      setProfile(userProfile);
      setOpportunities(userOpps);
      setActivities(userActs);
    } catch (e) {
      console.error('Error loading user data:', e);
    }
  }, []);

  const enterDemoMode = useCallback(() => {
    setIsDemoMode(true);
    const demoUser = {
      id: 'demo-user-123',
      email: 'alex.rivera@example.edu',
      name: 'Alex Rivera',
    };
    setUser(demoUser);
    loadUserData(demoUser.id);
  }, [loadUserData]);

  useEffect(() => {
    async function initAuth() {
      setLoading(true);

      if (!isSupabaseReady) {
        // If Supabase credentials are not filled, start in demo mode so the UI works out of the box
        enterDemoMode();
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (authUser) {
          setIsDemoMode(false);
          setUser({
            id: authUser.id,
            email: authUser.email || '',
            name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
          });
          await loadUserData(authUser.id);
        } else {
          // Check if local storage flag had demo mode
          const savedMode = localStorage.getItem('applypilot_demo_mode');
          if (savedMode === 'true') {
            enterDemoMode();
          } else {
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        enterDemoMode();
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, [isSupabaseReady, enterDemoMode, loadUserData]);

  const refreshData = async () => {
    if (user) {
      await loadUserData(user.id);
    }
  };

  const handleUpdateProfile = async (data: Partial<Profile>) => {
    if (!user) return;
    const updated = await DataService.updateProfile(user.id, data);
    setProfile(updated);
  };

  const handleAddOpportunity = async (
    data: Omit<Opportunity, 'id' | 'created_at' | 'updated_at' | 'user_id'>
  ): Promise<Opportunity> => {
    if (!user) throw new Error('User not authenticated');
    const newOpp = await DataService.createOpportunity({
      ...data,
      user_id: user.id,
    });
    setOpportunities((prev) => [newOpp, ...prev]);
    // Refresh activities
    const acts = await DataService.getActivityLogs(user.id);
    setActivities(acts);
    return newOpp;
  };

  const handleUpdateOpportunity = async (
    id: string,
    updates: Partial<Opportunity>
  ): Promise<Opportunity> => {
    const updated = await DataService.updateOpportunity(id, updates);
    setOpportunities((prev) => prev.map((o) => (o.id === id ? updated : o)));
    if (user) {
      const acts = await DataService.getActivityLogs(user.id);
      setActivities(acts);
    }
    return updated;
  };

  const handleDeleteOpportunity = async (id: string): Promise<void> => {
    await DataService.deleteOpportunity(id);
    setOpportunities((prev) => prev.filter((o) => o.id !== id));
    if (user) {
      await DataService.logActivity(user.id, null, 'deleted', `Removed opportunity`);
      const acts = await DataService.getActivityLogs(user.id);
      setActivities(acts);
    }
  };

  const resetToSeedData = () => {
    DataService.resetDemoData();
    if (user?.id) {
      loadUserData(user.id);
    }
  };

  const signOut = async () => {
    if (isSupabaseReady) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    localStorage.removeItem('applypilot_demo_mode');
    setUser(null);
    setIsDemoMode(false);
  };

  const currentDate = useCurrentDate();

  const stats: DashboardStats = useMemo(() => {
    const totalOpportunities = opportunities.length;
    const submittedApplications = opportunities.filter((o) =>
      ['Applied', 'Interview', 'Accepted', 'Rejected'].includes(o.status)
    ).length;

    if (!currentDate) {
      return {
        totalOpportunities,
        submittedApplications,
        upcomingDeadlines: 0,
        awaitingFollowUp: 0,
      };
    }

    const upcomingDeadlines = opportunities.filter((o) => {
      if (!o.deadline) return false;
      const d = new Date(o.deadline);
      return d >= currentDate && !['Applied', 'Accepted', 'Rejected', 'Withdrawn'].includes(o.status);
    }).length;

    const awaitingFollowUp = opportunities.filter((o) => {
      if (o.status === 'Applied' && o.follow_up_date) {
        const f = new Date(o.follow_up_date);
        return f <= currentDate;
      }
      return false;
    }).length;

    return {
      totalOpportunities,
      submittedApplications,
      upcomingDeadlines,
      awaitingFollowUp,
    };
  }, [opportunities, currentDate]);

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        isDemoMode,
        isSupabaseReady,
        profile,
        opportunities,
        activities,
        stats,
        refreshData,
        updateProfile: handleUpdateProfile,
        addOpportunity: handleAddOpportunity,
        updateOpportunity: handleUpdateOpportunity,
        deleteOpportunity: handleDeleteOpportunity,
        resetToSeedData,
        signOut,
        enterDemoMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
