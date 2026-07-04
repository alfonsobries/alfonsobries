import { Image } from 'expo-image';
import { Redirect, router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { CaretRight, LockKey, Plus, Star } from 'phosphor-react-native';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { deleteChore, fetchChores, type Chore } from '@/api/chores';
import { getPerson, isKid } from '@/api/family';
import { useApiRouter } from '@/api/router';
import { Button } from '@/components/ui/Button';
import { useThemeColor } from '@/hooks/use-theme-color';

// The parents' list of a kid's daily chores: add, edit, or retire them.
// The whole screen sits behind Face ID.
export default function ManageChoresScreen() {
  const { member } = useLocalSearchParams<{ member?: string }>();
  const route = useApiRouter();
  const accent = useThemeColor('primary-emphasis');
  const muted = useThemeColor('muted');

  const [unlocked, setUnlocked] = useState(false);
  const [chores, setChores] = useState<Chore[]>([]);

  const person = member ? getPerson(member) : undefined;
  const kid = person && isKid(person.key) ? person.key : undefined;

  const load = useCallback(async () => {
    if (!kid) {
      return;
    }

    try {
      setChores(await fetchChores(route, kid));
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
      promptMessage: "Confirm it's you to manage chores",
      cancelLabel: 'Cancel',
    });

    if (result.success) {
      setUnlocked(true);
    }
  }

  function handleDelete(chore: Chore): void {
    Alert.alert(`Remove “${chore.name}”?`, 'Past days keep their history.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await deleteChore(route, chore.id);
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
      <Stack.Screen options={{ title: `${person.name}'s chores` }} />

      {unlocked ? (
        <ScrollView
          className="flex-1 bg-background"
          contentInsetAdjustmentBehavior="automatic"
          contentContainerClassName="gap-4 p-4"
        >
          {chores.length > 0 ? (
            <View className="overflow-hidden rounded-3xl bg-surface">
              {chores.map((chore, index) => (
                <Pressable
                  key={chore.id}
                  accessibilityRole="button"
                  accessibilityLabel={chore.name}
                  onPress={() =>
                    router.push({
                      pathname: '/chores/edit',
                      params: {
                        member: kid,
                        id: String(chore.id),
                        points: String(chore.points),
                        name: chore.name,
                        ...(chore.image_url ? { image: chore.image_url } : {}),
                      },
                    })
                  }
                  onLongPress={() => handleDelete(chore)}
                  className={`flex-row items-center gap-3 p-3 active:opacity-70 ${
                    index > 0 ? 'border-t border-border' : ''
                  }`}
                >
                  <View className="size-12 items-center justify-center overflow-hidden rounded-xl bg-surface-selected">
                    {chore.image_url ? (
                      <Image
                        source={{ uri: chore.image_url }}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                      />
                    ) : (
                      <Star size={22} color={accent} weight="fill" />
                    )}
                  </View>
                  <View className="flex-1 gap-0.5">
                    <Text className="text-base font-medium text-foreground" numberOfLines={1}>
                      {chore.name}
                    </Text>
                    <Text className="text-sm text-muted">
                      {chore.points} point{chore.points === 1 ? '' : 's'}
                    </Text>
                  </View>
                  <CaretRight size={18} color={muted} />
                </Pressable>
              ))}
            </View>
          ) : (
            <Text className="py-6 text-center text-sm text-muted">
              Nothing yet — add the first daily chore.
            </Text>
          )}

          <Text className="px-4 text-center text-xs text-muted">
            Tap to edit · long-press to remove
          </Text>

          <Button icon={Plus} onPress={() => router.push(`/chores/edit?member=${kid}`)}>
            Add chore
          </Button>
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center gap-6 bg-background px-6">
          <Text className="text-center text-base text-muted">
            Managing {person.name}&apos;s chores is for parents.
          </Text>
          <Button fullWidth icon={LockKey} onPress={() => void handleUnlock()}>
            Unlock with Face ID
          </Button>
        </View>
      )}
    </>
  );
}
