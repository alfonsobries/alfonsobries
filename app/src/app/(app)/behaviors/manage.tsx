import { Illustration } from '@/components/ui/Illustration';
import { Redirect, router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { CaretRight, HandPalm, LockKey, Plus } from 'phosphor-react-native';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { deleteBehavior, fetchBehaviors, type Behavior } from '@/api/behaviors';
import { getPerson, isKid } from '@/api/family';
import { useApiRouter } from '@/api/router';
import { Button } from '@/components/ui/Button';
import { useThemeColor } from '@/hooks/use-theme-color';

// The parents' list of a kid's behaviors: add, edit, or retire them. The
// whole screen sits behind Face ID.
export default function ManageBehaviorsScreen() {
  const { member } = useLocalSearchParams<{ member?: string }>();
  const route = useApiRouter();
  const accent = useThemeColor('primary-emphasis');
  const muted = useThemeColor('muted');

  const [unlocked, setUnlocked] = useState(false);
  const [behaviors, setBehaviors] = useState<Behavior[]>([]);

  const person = member ? getPerson(member) : undefined;
  const kid = person && isKid(person.key) ? person.key : undefined;

  const load = useCallback(async () => {
    if (!kid) {
      return;
    }

    try {
      setBehaviors(await fetchBehaviors(route, kid));
    } catch {
      // Keep the previous list; the next focus retries.
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

  async function handleUnlock(): Promise<void> {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Confirm it's you to manage behaviors",
      cancelLabel: 'Cancel',
    });

    if (result.success) {
      setUnlocked(true);
    }
  }

  function handleDelete(behavior: Behavior): void {
    Alert.alert(`Remove “${behavior.name}”?`, 'Past feed entries keep their history.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await deleteBehavior(route, behavior.id);
              await load();
            } catch {
              Alert.alert('Could not remove', 'Please try again in a moment.');
            }
          })();
        },
      },
    ]);
  }

  return (
    <>
      <Stack.Screen options={{ title: `${person.name}'s behaviors` }} />

      {unlocked ? (
        <ScrollView
          className="flex-1 bg-background"
          contentInsetAdjustmentBehavior="automatic"
          contentContainerClassName="gap-4 p-4"
        >
          {behaviors.length > 0 ? (
            <View className="overflow-hidden rounded-3xl bg-surface">
              {behaviors.map((behavior, index) => (
                <Pressable
                  key={behavior.id}
                  accessibilityRole="button"
                  accessibilityLabel={behavior.name}
                  onPress={() =>
                    router.push({
                      pathname: '/behaviors/edit',
                      params: {
                        member: kid,
                        id: String(behavior.id),
                        points: String(behavior.points),
                        name: behavior.name,
                        ...(behavior.image_url ? { image: behavior.image_url } : {}),
                      },
                    })
                  }
                  onLongPress={() => handleDelete(behavior)}
                  className={`flex-row items-center gap-3 p-3 active:opacity-70 ${
                    index > 0 ? 'border-t border-border' : ''
                  }`}
                >
                  <View className="size-12 items-center justify-center overflow-hidden rounded-xl bg-surface-selected">
                    {behavior.image_url ? (
                      <Illustration source={{ uri: behavior.image_url }} />
                    ) : (
                      <HandPalm size={22} color={accent} weight="fill" />
                    )}
                  </View>
                  <View className="flex-1 gap-0.5">
                    <Text className="text-base font-medium text-foreground" numberOfLines={1}>
                      {behavior.name}
                    </Text>
                    <Text className="text-sm text-muted">
                      {behavior.points} mood point{behavior.points === 1 ? '' : 's'}
                    </Text>
                  </View>
                  <CaretRight size={18} color={muted} />
                </Pressable>
              ))}
            </View>
          ) : (
            <Text className="py-6 text-center text-sm text-muted">
              Nothing yet — add the first behavior to work on.
            </Text>
          )}

          <Text className="px-4 text-center text-xs text-muted">
            Tap to edit · long-press to remove
          </Text>

          <Button icon={Plus} onPress={() => router.push(`/behaviors/edit?member=${kid}`)}>
            Add behavior
          </Button>
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center gap-6 bg-background px-6">
          <Text className="text-center text-base text-muted">
            Managing {person.name}&apos;s behaviors is for parents.
          </Text>
          <Button fullWidth icon={LockKey} onPress={() => void handleUnlock()}>
            Unlock with Face ID
          </Button>
        </View>
      )}
    </>
  );
}
