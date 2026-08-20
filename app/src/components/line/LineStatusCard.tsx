import { Text, View } from 'react-native';

import type { LineNumber } from '@/api/line';
import { Card } from '@/components/ui/Card';
import { formatPhone } from '@/lib/phone';

type LineStatusCardProperties = {
  number: LineNumber | null;
};

export function LineStatusCard({ number }: LineStatusCardProperties) {
  if (!number) {
    return (
      <Card>
        <Text className="text-base font-medium text-foreground">Line not configured</Text>
        <Text className="mt-1 text-sm text-muted">
          The number has not been synced from the provider yet.
        </Text>
      </Card>
    );
  }

  const paused = number.status !== 'active';

  return (
    <Card>
      <Text className="text-xs uppercase tracking-wide text-muted">Private line</Text>
      <Text className="mt-1 text-2xl font-semibold text-foreground">
        {number.display ?? formatPhone(number.e164)}
      </Text>
      <View className="mt-3 flex-row items-center gap-2">
        <View className={`size-2 rounded-full ${paused ? 'bg-danger' : 'bg-success'}`} />
        <Text className="text-sm capitalize text-muted">{number.status}</Text>
      </View>
    </Card>
  );
}
