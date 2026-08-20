import { Text, View } from 'react-native';

import type { LineVoicemail } from '@/api/line';

type TranscriptCardProperties = {
  voicemail: LineVoicemail;
};

export function TranscriptCard({ voicemail }: TranscriptCardProperties) {
  const transcript = voicemail.transcript?.trim();
  const summary = voicemail.summary?.trim();
  const translation = voicemail.translation?.trim();
  const sentiment = voicemail.sentiment?.trim();

  if (!transcript && !summary) {
    return <Text className="text-sm text-muted">Transcript is still coming in.</Text>;
  }

  return (
    <View className="gap-3">
      {summary ? (
        <View className="gap-1">
          <Text className="text-xs uppercase tracking-wide text-muted">Summary</Text>
          <Text className="text-base leading-6 text-foreground">{summary}</Text>
        </View>
      ) : null}
      {sentiment ? (
        <View className="self-start rounded-full bg-surface-selected px-3 py-1">
          <Text className="text-xs font-medium capitalize text-foreground">{sentiment}</Text>
        </View>
      ) : null}
      {transcript ? (
        <View className="gap-1">
          <Text className="text-xs uppercase tracking-wide text-muted">Transcript</Text>
          <Text selectable className="text-base leading-6 text-foreground">
            {transcript}
          </Text>
        </View>
      ) : null}
      {translation && translation !== transcript ? (
        <View className="gap-1">
          <Text className="text-xs uppercase tracking-wide text-muted">Translation</Text>
          <Text selectable className="text-base leading-6 text-muted">
            {translation}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
