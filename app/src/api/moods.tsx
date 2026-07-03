import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { useAuth, type FamilyMember } from './auth';
import { apiClient } from './client';
import { useApiRouter } from './router';

// Mood lives on a 1–9 scale with 5 as the neutral centre; 1 is most upset and
// 9 is happiest. Kept in sync with `User::MOOD_*` on the API.
export const MOOD_MIN = 1;
export const MOOD_MAX = 9;
export const MOOD_NEUTRAL = 5;

export type MoodLevel = number;

export type MoodMember = {
  family_member: FamilyMember;
  name: string | null;
  mood: MoodLevel;
};

type MoodsStatus = 'loading' | 'ready' | 'error';

type MoodsContextValue = {
  status: MoodsStatus;
  members: MoodMember[];
  refresh: () => Promise<void>;
  updateMyMood: (mood: MoodLevel) => Promise<void>;
};

const MoodsContext = createContext<MoodsContextValue | undefined>(undefined);

/** A short, kid-readable word for a mood level. */
export function moodLabel(mood: MoodLevel): string {
  if (mood <= 2) {
    return 'Upset';
  }
  if (mood <= 4) {
    return 'A bit low';
  }
  if (mood <= 6) {
    return 'Okay';
  }
  if (mood <= 8) {
    return 'Happy';
  }
  return 'Great';
}

type MoodsProviderProperties = {
  children: ReactNode;
};

export function MoodsProvider({ children }: MoodsProviderProperties): ReactNode {
  const route = useApiRouter();
  const { user, status: authStatus } = useAuth();
  const [status, setStatus] = useState<MoodsStatus>('loading');
  const [members, setMembers] = useState<MoodMember[]>([]);

  const refresh = useCallback(async () => {
    try {
      const { data } = await apiClient.get<{ data: MoodMember[] }>(route('api.moods.index'));
      setMembers(data.data);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, [route]);

  useEffect(() => {
    if (authStatus !== 'authenticated') {
      return;
    }

    void (async () => {
      await refresh();
    })();
  }, [authStatus, refresh]);

  const updateMyMood = useCallback(
    async (mood: MoodLevel) => {
      const mine = user?.family_member;
      if (!mine) {
        return;
      }

      // Optimistically reflect the change, then reconcile with the API's copy.
      setMembers((current) =>
        current.map((member) => (member.family_member === mine ? { ...member, mood } : member)),
      );

      try {
        const { data } = await apiClient.patch<{ data: MoodMember }>(route('api.mood.update'), {
          mood,
        });
        setMembers((current) =>
          current.map((member) =>
            member.family_member === data.data.family_member ? data.data : member,
          ),
        );
      } catch (error) {
        await refresh();
        throw error;
      }
    },
    [route, user?.family_member, refresh],
  );

  return (
    <MoodsContext.Provider value={{ status, members, refresh, updateMyMood }}>
      {children}
    </MoodsContext.Provider>
  );
}

export function useMoods(): MoodsContextValue {
  const context = useContext(MoodsContext);

  if (!context) {
    throw new Error('useMoods must be used within a MoodsProvider');
  }

  return context;
}
