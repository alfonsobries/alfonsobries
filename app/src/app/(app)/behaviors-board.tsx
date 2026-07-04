import { Redirect, router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { fetchBehaviors, type Behavior } from '@/api/behaviors';
import { getPerson, isKid } from '@/api/family';
import { useApiRouter } from '@/api/router';
import { BehaviorTile } from '@/components/behaviors/BehaviorTile';

// The behavior board, opened from the kid's profile: every behavior as a big
// illustrated tile. Tapping one starts the Face ID-confirmed log flow.
export default function BehaviorsBoardScreen() {
  const { member } = useLocalSearchParams<{ member?: string }>();
  const route = useApiRouter();

  const [behaviors, setBehaviors] = useState<Behavior[]>([]);
  const [loaded, setLoaded] = useState(false);

  const person = member ? getPerson(member) : undefined;
  const kid = person && isKid(person.key) ? person.key : undefined;

  const load = useCallback(async () => {
    if (!kid) {
      return;
    }

    try {
      setBehaviors(await fetchBehaviors(route, kid));
      setLoaded(true);
    } catch {
      // The next focus retries.
    }
  }, [route, kid]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  if (!person || !kid) {
    return <Redirect href="/" />;
  }

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

  return (
    <>
      <Stack.Screen options={{ title: `${person.name}'s behaviors` }} />
      <ScrollView
        className="flex-1 bg-background"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="p-4"
      >
        {behaviors.length > 0 ? (
          <View className="-m-1.5 flex-row flex-wrap">
            {behaviors.map((behavior) => (
              <View key={behavior.id} className="w-1/2 p-1.5">
                <BehaviorTile behavior={behavior} onPress={() => handleTilePress(behavior)} />
              </View>
            ))}
          </View>
        ) : loaded ? (
          <Text className="py-6 text-center text-sm text-muted">
            No behaviors yet — add the first one from the profile menu.
          </Text>
        ) : null}
      </ScrollView>
    </>
  );
}
