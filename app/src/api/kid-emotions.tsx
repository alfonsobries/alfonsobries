import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { useAuth } from './auth';
import { apiClient } from './client';
import { useApiRouter } from './router';

export type KidMember = 'regina' | 'andres';

export const KID_EMOTIONS = [
  'happy',
  'sad',
  'angry',
  'scared',
  'surprised',
  'disgusted',
  'excited',
  'proud',
  'loved',
  'grateful',
  'calm',
  'hopeful',
  'curious',
  'playful',
  'bored',
  'tired',
  'nervous',
  'confused',
  'frustrated',
  'worried',
  'lonely',
  'disappointed',
  'jealous',
  'embarrassed',
] as const;

export type KidEmotion = (typeof KID_EMOTIONS)[number];

const EMOTION_LABELS: Record<KidMember, Record<KidEmotion, string>> = {
  regina: {
    happy: 'Feliz',
    sad: 'Triste',
    angry: 'Enojada',
    scared: 'Asustada',
    surprised: 'Sorprendida',
    disgusted: 'Con asco',
    excited: 'Emocionada',
    proud: 'Orgullosa',
    loved: 'Querida',
    grateful: 'Agradecida',
    calm: 'Tranquila',
    hopeful: 'Esperanzada',
    curious: 'Curiosa',
    playful: 'Juguetona',
    bored: 'Aburrida',
    tired: 'Cansada',
    nervous: 'Nerviosa',
    confused: 'Confundida',
    frustrated: 'Frustrada',
    worried: 'Preocupada',
    lonely: 'Sola',
    disappointed: 'Decepcionada',
    jealous: 'Celosa',
    embarrassed: 'Avergonzada',
  },
  andres: {
    happy: 'Feliz',
    sad: 'Triste',
    angry: 'Enojado',
    scared: 'Asustado',
    surprised: 'Sorprendido',
    disgusted: 'Con asco',
    excited: 'Emocionado',
    proud: 'Orgulloso',
    loved: 'Querido',
    grateful: 'Agradecido',
    calm: 'Tranquilo',
    hopeful: 'Esperanzado',
    curious: 'Curioso',
    playful: 'Juguetón',
    bored: 'Aburrido',
    tired: 'Cansado',
    nervous: 'Nervioso',
    confused: 'Confundido',
    frustrated: 'Frustrado',
    worried: 'Preocupado',
    lonely: 'Solo',
    disappointed: 'Decepcionado',
    jealous: 'Celoso',
    embarrassed: 'Avergonzado',
  },
};

export type KidEmotionRecord = {
  family_member: KidMember;
  name: string | null;
  emotion: KidEmotion | null;
};

type KidEmotionsStatus = 'loading' | 'ready' | 'error';

type KidEmotionsContextValue = {
  status: KidEmotionsStatus;
  members: KidEmotionRecord[];
  refresh: () => Promise<void>;
  updateEmotion: (member: KidMember, emotion: KidEmotion) => Promise<void>;
};

const KidEmotionsContext = createContext<KidEmotionsContextValue | undefined>(undefined);

export function emotionLabel(member: KidMember, emotion: KidEmotion): string {
  return EMOTION_LABELS[member][emotion];
}

export function KidEmotionsProvider({ children }: { children: ReactNode }): ReactNode {
  const route = useApiRouter();
  const { status: authStatus } = useAuth();
  const [status, setStatus] = useState<KidEmotionsStatus>('loading');
  const [members, setMembers] = useState<KidEmotionRecord[]>([]);

  const refresh = useCallback(async () => {
    try {
      const { data } = await apiClient.get<{ data: KidEmotionRecord[] }>(
        route('api.kid-emotions.index'),
      );
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

  const updateEmotion = useCallback(
    async (member: KidMember, emotion: KidEmotion) => {
      setMembers((current) =>
        current.map((entry) => (entry.family_member === member ? { ...entry, emotion } : entry)),
      );

      try {
        const { data } = await apiClient.patch<{ data: KidEmotionRecord }>(
          route('api.kid-emotions.update', { member }),
          { emotion },
        );
        setMembers((current) =>
          current.map((entry) =>
            entry.family_member === data.data.family_member ? data.data : entry,
          ),
        );
      } catch (error) {
        await refresh();
        throw error;
      }
    },
    [refresh, route],
  );

  return (
    <KidEmotionsContext.Provider value={{ status, members, refresh, updateEmotion }}>
      {children}
    </KidEmotionsContext.Provider>
  );
}

export function useKidEmotions(): KidEmotionsContextValue {
  const context = useContext(KidEmotionsContext);

  if (!context) {
    throw new Error('useKidEmotions must be used within a KidEmotionsProvider');
  }

  return context;
}
