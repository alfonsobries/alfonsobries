import { router } from 'expo-router';
import { Smiley } from 'phosphor-react-native';
import { Text, View } from 'react-native';

import { useAuth } from '@/api/auth';
import { isKid, type Person } from '@/api/family';
import { moodEmoji, moodLabel, useMoods } from '@/api/moods';
import { KidBehaviorsSection } from '@/components/behaviors/KidBehaviorsSection';
import { KidChoresSection } from '@/components/chores/KidChoresSection';
import { AvatarCircle } from '@/components/family/AvatarCircle';
import { ActionTile } from '@/components/ui/ActionTile';
import { GrowthCard } from '@/components/virtue/GrowthCard';
import { VirtueCover } from '@/components/virtue/VirtueCover';

// The body of a person's profile — compact avatar header, mood, and their
// sections. Rendered inside a scroll view by both the profile detail screen
// and the "Profile" tab.
export function ProfileView({ person }: { person: Person }) {
  const { user } = useAuth();
  const { members } = useMoods();
  const record = person.hasMood
    ? members.find((entry) => entry.family_member === person.key)
    : undefined;

  // The virtue practice belongs to one person and only shows on their own tab.
  const ownVirtue = person.key === 'alfonso' && user?.family_member === 'alfonso';

  return (
    <>
      {ownVirtue ? <VirtueCover /> : null}

      <View className="flex-row items-center gap-4">
        <AvatarCircle person={person.key} mood={record?.mood} size={isKid(person.key) ? 72 : 88} />
        <View className="flex-1 gap-0.5">
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

      {person.hasMood ? (
        <>
          {ownVirtue ? <GrowthCard /> : null}

          <View className="flex-row flex-wrap">
            <View className="w-1/2 p-1.5">
              <ActionTile
                icon={Smiley}
                label="Adjust mood"
                onPress={() => router.push(`/mood?member=${person.key}`)}
              />
            </View>
          </View>
        </>
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
