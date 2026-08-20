import { Redirect, Stack, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Text, View } from 'react-native';

import { useAuth } from '@/api/auth';
import {
  contactLabel,
  fetchLineVoicemailAudio,
  fetchLineVoicemails,
  markLineVoicemailHeard,
  type LineVoicemail,
} from '@/api/line';
import { useApiRouter } from '@/api/router';
import { TranscriptCard } from '@/components/line/TranscriptCard';
import { VoicemailPlayer } from '@/components/line/VoicemailPlayer';
import { Card } from '@/components/ui/Card';
import { useLineChannel } from '@/hooks/use-line-channel';
import { formatDuration, formatLineTime } from '@/lib/line-time';
import { formatPhone } from '@/lib/phone';
import { cacheKeys } from '@/offline/store';
import { useCachedResource } from '@/offline/use-cached-resource';

export default function LineVoicemailScreen() {
  const { user } = useAuth();
  const route = useApiRouter();
  const fetcher = useCallback(() => fetchLineVoicemails(route), [route]);
  const list = useCachedResource<LineVoicemail[]>(cacheKeys.lineVoicemails, fetcher);
  const [audioUrls, setAudioUrls] = useState<Record<number, string>>({});
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const refresh = list.refresh;

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  useLineChannel({
    onVoicemail: () => {
      void refresh();
    },
  });

  const handlePlay = async (voicemail: LineVoicemail) => {
    if (audioUrls[voicemail.id] || !voicemail.has_audio) {
      return;
    }

    setLoadingId(voicemail.id);
    try {
      const url = await fetchLineVoicemailAudio(route, voicemail.id);
      setAudioUrls((current) => ({ ...current, [voicemail.id]: url }));
      if (voicemail.heard_at === null) {
        const heard = await markLineVoicemailHeard(route, voicemail.id);
        list.update((current) =>
          (current ?? []).map((item) => (item.id === heard.id ? heard : item)),
        );
      }
    } finally {
      setLoadingId(null);
    }
  };

  if (user && user.family_member !== 'alfonso') {
    return <Redirect href="/" />;
  }

  return (
    <>
      <Stack.Screen.Title>Voicemail</Stack.Screen.Title>
      <FlatList
        className="flex-1 bg-background"
        contentContainerClassName="gap-3 px-4 pb-16 pt-4"
        contentInsetAdjustmentBehavior="automatic"
        data={list.data ?? []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => {
          const contact = item.contact;
          const name = contact ? contactLabel(contact) : 'Unknown';

          return (
            <Card
              onPress={() => {
                void handlePlay(item);
              }}
            >
              <View className="gap-3">
                <View className="flex-row items-start justify-between gap-3">
                  <View className="min-w-0 flex-1">
                    <Text className="text-base font-semibold text-foreground">{name}</Text>
                    {contact?.name ? (
                      <Text className="text-xs text-muted">{formatPhone(contact.e164)}</Text>
                    ) : null}
                  </View>
                  <Text className="text-xs text-muted">{formatLineTime(item.received_at)}</Text>
                </View>
                <VoicemailPlayer
                  url={audioUrls[item.id] ?? null}
                  durationSec={item.duration_sec}
                  loading={loadingId === item.id}
                />
                {item.duration_sec ? (
                  <Text className="text-xs text-muted">{formatDuration(item.duration_sec)}</Text>
                ) : null}
                <TranscriptCard voicemail={item} />
              </View>
            </Card>
          );
        }}
        ListEmptyComponent={
          list.status === 'loading' ? (
            <View className="h-40 animate-pulse rounded-3xl bg-surface" />
          ) : (
            <Text className="px-2 pt-8 text-center text-base text-muted">No voicemails yet.</Text>
          )
        }
      />
    </>
  );
}
