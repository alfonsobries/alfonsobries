import { router } from 'expo-router';
import { Smiley, Star } from 'phosphor-react-native';
import { Text, View } from 'react-native';

import { isKid, type Person } from '@/api/family';
import { moodEmoji, moodLabel, useMoods } from '@/api/moods';
import { KidBehaviorsSection } from '@/components/behaviors/KidBehaviorsSection';
import { KidChoresSection } from '@/components/chores/KidChoresSection';
import { AvatarCircle } from '@/components/family/AvatarCircle';
import { ActionTile } from '@/components/ui/ActionTile';

// The body of a person's profile — avatar, name, mood, and action tiles.
// Rendered inside a scroll view by both the profile detail screen and the
// "Profile" tab.
export function ProfileView({ person }: { person: Person }) {
  const { members } = useMoods();
  const record = person.hasMood
    ? members.find((entry) => entry.family_member === person.key)
    : undefined;

  const compact = isKid(person.key);

  return (
    <>
      {compact ? (
        // The kids' profile carries rewards, chores and behaviors, so the
        // header stays small and out of the way.
        <View className="flex-row items-center gap-3">
          <AvatarCircle person={person.key} size={72} />
          <Text className="text-2xl font-semibold text-foreground">{person.name}</Text>
        </View>
      ) : (
        <View className="items-center gap-3 pt-2">
          <AvatarCircle person={person.key} mood={record?.mood} size={176} />

          <View className="items-center gap-1">
            <View className="flex-row items-center gap-2">
              <Text className="text-2xl font-semibold text-foreground">{person.name}</Text>
              {person.hasMood && record ? (
                <Text className="text-2xl">{moodEmoji(record.mood)}</Text>
              ) : null}
            </View>
            {person.hasMood && record ? (
              <Text className="text-base text-muted">
                Feels {moodLabel(record.mood).toLowerCase()}
              </Text>
            ) : null}
          </View>
        </View>
      )}

      {person.hasMood ? (
        <View className="flex-row flex-wrap">
          <View className="w-1/2 p-1.5">
            <ActionTile
              icon={Smiley}
              label="Adjust mood"
              onPress={() => router.push(`/mood?member=${person.key}`)}
            />
          </View>
          <View className="w-1/2 p-1.5">
            <ActionTile icon={Star} label="Coming soon" disabled />
          </View>
        </View>
      ) : isKid(person.key) ? (
        <>
          <KidChoresSection member={person.key} />
          <KidBehaviorsSection member={person.key} />
        </>
      ) : (
        <Text className="text-center text-sm text-muted">Nothing here yet.</Text>
      )}
    </>
  );
}
