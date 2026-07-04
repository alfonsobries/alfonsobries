import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';

import {
  deleteBehaviorLog,
  fetchBehaviorLogs,
  type BehaviorLogEntry,
  type KidMember,
} from '@/api/behaviors';
import { useMoods } from '@/api/moods';
import { useApiRouter } from '@/api/router';
import { BehaviorFeed } from '@/components/behaviors/BehaviorFeed';
import { IllustratedButton } from '@/components/ui/IllustratedButton';
import { Button } from '@/components/ui/Button';

const behaviorsArt = require('../../../assets/illustrations/behaviors-button.png');

// How many recent entries the profile shows before "See all".
const RECENT_LIMIT = 5;

type KidBehaviorsSectionProperties = {
  member: KidMember;
};

// The behaviors block on a kid's profile: the doorway into the behavior
// board and the recent history, with the full feed one tap away.
export function KidBehaviorsSection({ member }: KidBehaviorsSectionProperties) {
  const route = useApiRouter();
  const { refresh: refreshMoods } = useMoods();

  const [entries, setEntries] = useState<BehaviorLogEntry[]>([]);
  const [hasMore, setHasMore] = useState(false);

  const load = useCallback(async () => {
    try {
      const page = await fetchBehaviorLogs(route, { member });
      setEntries(page.entries.slice(0, RECENT_LIMIT));
      setHasMore(page.entries.length > RECENT_LIMIT || page.nextPage !== null);
    } catch {
      // A pull refresh happens on the next focus; keep whatever we had.
    }
  }, [route, member]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function handleUndo(entry: BehaviorLogEntry): Promise<void> {
    try {
      await deleteBehaviorLog(route, entry.id);
      await Promise.all([load(), refreshMoods()]);
    } catch {
      // The entry stays; a retry is one long-press away.
    }
  }

  return (
    <View className="gap-6">
      <IllustratedButton
        image={behaviorsArt}
        label="Behaviors"
        subtitle="Log what happened"
        onPress={() => router.push({ pathname: '/behaviors-board', params: { member } })}
      />

      <View className="gap-3">
        <Text className="text-xs font-semibold uppercase tracking-wider text-muted">Recent</Text>
        <BehaviorFeed entries={entries} onUndo={(entry) => void handleUndo(entry)} />
        {hasMore ? (
          <Button
            variant="ghost"
            size="sm"
            onPress={() => router.push({ pathname: '/behavior-feed', params: { member } })}
          >
            See all
          </Button>
        ) : null}
      </View>
    </View>
  );
}
