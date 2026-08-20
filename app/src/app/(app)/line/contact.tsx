import { Redirect, router, Stack, useLocalSearchParams, type Href } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';

import { useAuth } from '@/api/auth';
import { fetchLineThread, updateLineContact, type LineContact } from '@/api/line';
import { useApiRouter } from '@/api/router';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { formatPhone } from '@/lib/phone';
import { isOfflineError } from '@/offline/connectivity';
import { cacheKeys, readCache } from '@/offline/store';

export default function LineContactScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams<{ contact?: string }>();
  const contactId = params.contact ? Number(params.contact) : NaN;
  const route = useApiRouter();
  const cached = Number.isFinite(contactId)
    ? readCache<{ contact: LineContact }>(cacheKeys.lineThread(String(contactId)))?.contact
    : null;
  const [contact, setContact] = useState<LineContact | null>(cached ?? null);
  const [name, setName] = useState(cached?.name ?? '');
  const [notes, setNotes] = useState(cached?.notes ?? '');
  const [blocked, setBlocked] = useState(cached?.blocked ?? false);
  const [favorite, setFavorite] = useState(cached?.favorite ?? false);
  const [saving, setSaving] = useState(false);
  const hadCache = useRef(cached !== null);

  const hydrate = useCallback((next: LineContact) => {
    setContact(next);
    setName(next.name ?? '');
    setNotes(next.notes ?? '');
    setBlocked(next.blocked);
    setFavorite(next.favorite);
  }, []);

  useEffect(() => {
    if (!Number.isFinite(contactId)) {
      return;
    }

    void (async () => {
      try {
        const detail = await fetchLineThread(route, contactId);
        hydrate(detail.contact);
      } catch (error) {
        if (!hadCache.current) {
          Alert.alert(
            'Could not load contact',
            isOfflineError(error) ? 'You are offline right now.' : 'Please try again.',
          );
        }
      }
    })();
  }, [contactId, hydrate, route]);

  const handleSave = async () => {
    if (!contact) {
      return;
    }

    setSaving(true);
    try {
      const saved = await updateLineContact(route, contact.id, {
        name: name.trim() === '' ? null : name.trim(),
        notes: notes.trim() === '' ? null : notes.trim(),
        blocked,
        favorite,
      });
      hydrate(saved);
      router.back();
    } catch (error) {
      Alert.alert(
        'Could not save',
        isOfflineError(error) ? 'You are offline right now.' : 'Please try again.',
      );
    } finally {
      setSaving(false);
    }
  };

  if (user && user.family_member !== 'alfonso') {
    return <Redirect href="/" />;
  }

  return (
    <>
      <Stack.Screen.Title>{contact?.name ?? 'Contact'}</Stack.Screen.Title>
      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="gap-5 px-4 pb-16 pt-4"
        contentInsetAdjustmentBehavior="automatic"
      >
        <Text className="text-center text-lg text-muted">
          {contact ? formatPhone(contact.e164) : ''}
        </Text>
        {contact ? (
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Button
                onPress={() => router.push(`/line/thread?contact=${contact.id}` as Href)}
                variant="secondary"
                fullWidth
              >
                Message
              </Button>
            </View>
            <View className="flex-1">
              <Button
                onPress={() =>
                  router.push(`/line/dialer?to=${encodeURIComponent(contact.e164)}` as Href)
                }
                fullWidth
              >
                Call
              </Button>
            </View>
          </View>
        ) : null}
        <Input label="Name" value={name} onChangeText={setName} placeholder="Add a name" />
        <Input
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Who is this?"
          multiline
        />
        <View className="flex-row items-center justify-between rounded-3xl bg-surface px-4 py-3">
          <View className="flex-1 pr-4">
            <Text className="text-base font-medium text-foreground">Favorite</Text>
            <Text className="text-sm text-muted">Pins them higher in your own head.</Text>
          </View>
          <Switch value={favorite} onValueChange={setFavorite} />
        </View>
        <View className="flex-row items-center justify-between rounded-3xl bg-surface px-4 py-3">
          <View className="flex-1 pr-4">
            <Text className="text-base font-medium text-foreground">Silence</Text>
            <Text className="text-sm text-muted">Still recorded. Nothing rings, no push.</Text>
          </View>
          <Switch value={blocked} onValueChange={setBlocked} />
        </View>
        <Button onPress={() => void handleSave()} loading={saving} fullWidth>
          Save
        </Button>
      </ScrollView>
    </>
  );
}
