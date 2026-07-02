import { Pressable, Text, View } from 'react-native';

import type { ApiStatus } from '@/hooks/use-status';

type ApiStatusCardProperties = {
  status: ApiStatus | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
};

function formatServerTime(serverTime: string): string {
  const parsed = new Date(serverTime);
  return Number.isNaN(parsed.getTime())
    ? serverTime
    : parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function ApiStatusCard({ status, isLoading, error, onRetry }: ApiStatusCardProperties) {
  const isOnline = !error && status !== null;
  const dotColor = isLoading ? 'bg-muted' : isOnline ? 'bg-success' : 'bg-danger';
  const label = isLoading ? 'Connecting to API…' : isOnline ? 'Connected to API' : 'API unreachable';

  return (
    <View className="w-full gap-3 self-stretch rounded-3xl bg-surface px-4 py-4">
      <View className="flex-row items-center gap-2">
        <View className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
        <Text className="text-sm font-semibold text-foreground">{label}</Text>
      </View>

      {isOnline ? (
        <View className="flex-row justify-between">
          <Text className="font-mono text-xs uppercase text-muted">{status.environment}</Text>
          <Text className="font-mono text-xs text-muted">
            v{status.version} · {formatServerTime(status.server_time)}
          </Text>
        </View>
      ) : null}

      {error ? (
        <Pressable
          onPress={onRetry}
          className="self-start rounded-lg bg-surface-selected px-3 py-1 active:opacity-70">
          <Text className="text-sm font-medium text-foreground">Retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
