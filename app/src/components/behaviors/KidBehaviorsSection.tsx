import { router, useFocusEffect } from 'expo-router';
import { GearSix } from 'phosphor-react-native';
import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';

import {
  deleteBehaviorLog,
  fetchBehaviorLogs,
  fetchBehaviors,
  type Behavior,
  type BehaviorLogEntry,
  type KidMember,
} from '@/api/behaviors';
import { useMoods } from '@/api/moods';
import { useApiRouter } from '@/api/router';
import { BehaviorFeed } from '@/components/behaviors/BehaviorFeed';
import { BehaviorTile } from '@/components/behaviors/BehaviorTile';
import { Button } from '@/components/ui/Button';

type KidBehaviorsSectionProperties = {
  member: KidMember;
};

// A kid's profile body: the grid of behavior buttons, the parents' entry to
// manage them, and the kid's recent history.
export function KidBehaviorsSection({ member }: KidBehaviorsSectionProperties) {
  const route = useApiRouter();
  const { refresh: refreshMoods } = useMoods();

  const [behaviors, setBehaviors] = useState<Behavior[]>([]);
  const [entries, setEntries] = useState<BehaviorLogEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    try {
      const [nextBehaviors, nextEntries] = await Promise.all([
        fetchBehaviors(route, member),
        fetchBehaviorLogs(route, member),
      ]);
      setBehaviors(nextBehaviors);
      setEntries(nextEntries);
      setLoaded(true);
    } catch {
      // A pull refresh happens on the next focus; keep whatever we had.
    }
  }, [route, member]);

  // Refresh whenever the profile regains focus — after logging, managing, or
  // undoing something on another screen.
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  function handleTilePress(behavior: Behavior): void {
    router.push({
      pathname: '/behavior-log',
      params: {
        id: String(behavior.id),
        member: behavior.family_member,
        points: String(behavior.points),
        name: behavior.name,
        ...(behavior.image_url ? { image: behavior.image_url } : {}),
      },
    });
  }

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
      {behaviors.length > 0 ? (
        <View className="-m-1.5 flex-row flex-wrap">
          {behaviors.map((behavior) => (
            <View key={behavior.id} className="w-1/2 p-1.5">
              <BehaviorTile behavior={behavior} onPress={() => handleTilePress(behavior)} />
            </View>
          ))}
        </View>
      ) : loaded ? (
        <Text className="text-center text-sm text-muted">
          No behaviors yet — add the first one below.
        </Text>
      ) : null}

      <Button
        variant="outline"
        icon={GearSix}
        onPress={() => router.push(`/behaviors/manage?member=${member}`)}
      >
        Manage behaviors
      </Button>

      <View className="gap-3">
        <Text className="text-xs font-semibold uppercase tracking-wider text-muted">Recent</Text>
        <BehaviorFeed entries={entries} onUndo={(entry) => void handleUndo(entry)} />
      </View>
    </View>
  );
}
