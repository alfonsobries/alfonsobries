import { router, Stack } from 'expo-router';
import { ChartPieSlice } from 'phosphor-react-native';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  type LayoutChangeEvent,
  Pressable,
  type ScrollViewProps,
  useWindowDimensions,
  View,
} from 'react-native';
import { KeyboardChatScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/api/auth';
import { restoreExpense } from '@/api/expenses';
import type { HomeMessage } from '@/api/home';
import { useApiRouter } from '@/api/router';
import { HomeComposer, type HomeComposerHandle } from '@/components/home/HomeComposer';
import { HomeHeaderMenu } from '@/components/home/HomeHeaderMenu';
import { HomeMessageRow } from '@/components/home/HomeMessageRow';
import { HomeWelcome } from '@/components/home/HomeWelcome';
import { TypingIndicator } from '@/components/home/TypingIndicator';
import { useExpensesChannel } from '@/hooks/use-expenses-channel';
import { useHomeChat } from '@/hooks/use-home-chat';
import { useThemeColor } from '@/hooks/use-theme-color';
import { isOfflineError } from '@/offline/connectivity';

/** The composer's height with a single line and no attachments. */
const COMPOSER_BASE_HEIGHT = 56;

/**
 * The couple's home: a chat with the household assistant. Expenses are told
 * here (typed, dictated or photographed) and come back as cards that open
 * for editing; totals and settings hang off the header.
 */
export default function CasaScreen() {
  const { user } = useAuth();
  const route = useApiRouter();
  const chat = useHomeChat(user?.id ?? null);
  const composerRef = useRef<HomeComposerHandle>(null);
  const window = useWindowDimensions();
  const tint = useThemeColor('foreground');
  const muted = useThemeColor('muted');

  // Where the screen's usable area ends: the native tab bar (and home
  // indicator) sit below it, and the keyboard is measured from the very
  // bottom of the screen, so both gaps matter.
  const [safeBottom, setSafeBottom] = useState(0);
  const [containerGap, setContainerGap] = useState(0);
  const containerRef = useRef<View>(null);
  const keyboardOffset = safeBottom + containerGap;

  const extraContentPadding = useSharedValue(0);

  const handleContainerLayout = () => {
    containerRef.current?.measureInWindow((_x, y, _width, height) => {
      setContainerGap(Math.max(0, window.height - (y + height)));
    });
  };

  const handleComposerLayout = (event: LayoutChangeEvent) => {
    const grown = Math.max(0, event.nativeEvent.layout.height - COMPOSER_BASE_HEIGHT);
    extraContentPadding.value = withTiming(grown, { duration: 200 });
  };

  useExpensesChannel(chat.refresh);

  const handleOpenExpense = useCallback((expenseId: number) => {
    router.push({ pathname: '/expenses/edit', params: { id: String(expenseId) } });
  }, []);

  const { replaceExpense } = chat;

  const handleRestoreExpense = useCallback(
    (expenseId: number) => {
      void (async () => {
        try {
          replaceExpense(await restoreExpense(route, expenseId));
        } catch (error) {
          Alert.alert(
            'No se pudo deshacer',
            isOfflineError(error) ? 'Estás sin conexión.' : 'Intenta de nuevo.',
          );
        }
      })();
    },
    [replaceExpense, route],
  );

  const renderScrollComponent = useCallback(
    (props: ScrollViewProps) => (
      <KeyboardChatScrollView
        {...props}
        inverted
        offset={keyboardOffset}
        extraContentPadding={extraContentPadding}
        keyboardLiftBehavior="always"
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustContentInsets={false}
        contentInsetAdjustmentBehavior="never"
      />
    ),
    [extraContentPadding, keyboardOffset],
  );

  const firstName = user?.name?.split(' ')[0] ?? null;
  const showWelcome = chat.loaded && chat.messages.length === 0;
  const waitingOnSend = chat.messages[0]?.role === 'user' && chat.messages[0]?.status === 'sending';

  const renderItem = useCallback(
    ({ item }: { item: HomeMessage }) => (
      <HomeMessageRow
        message={item}
        onRetry={chat.retry}
        onDiscard={chat.discard}
        onOpenExpense={handleOpenExpense}
        onRestoreExpense={handleRestoreExpense}
      />
    ),
    [chat.retry, chat.discard, handleOpenExpense, handleRestoreExpense],
  );

  const header = useMemo(
    () => (
      <Stack.Screen
        options={{
          headerRight: () => (
            <View className="flex-row items-center">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Estadísticas"
                hitSlop={8}
                onPress={() => router.push('/expenses/stats')}
                className="h-11 w-11 items-center justify-center active:opacity-60"
              >
                <ChartPieSlice size={22} color={tint} />
              </Pressable>
              <HomeHeaderMenu />
            </View>
          ),
        }}
      />
    ),
    [tint],
  );

  return (
    <View ref={containerRef} onLayout={handleContainerLayout} className="flex-1 bg-background">
      <Stack.Screen.Title>Casa</Stack.Screen.Title>
      {header}

      {/* Measures the native bottom inset of this screen, tab bar included. */}
      <SafeAreaView
        edges={['bottom']}
        pointerEvents="none"
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}
        onLayout={(event) => setSafeBottom(event.nativeEvent.layout.height)}
      />

      <View className="flex-1">
        {showWelcome ? (
          <HomeWelcome
            firstName={firstName}
            onSuggestion={(text) => composerRef.current?.prefill(text)}
          />
        ) : !chat.loaded ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={muted} />
          </View>
        ) : (
          <FlatList
            data={chat.messages}
            inverted
            keyExtractor={(message) => String(message.client_key ?? message.id)}
            renderItem={renderItem}
            renderScrollComponent={renderScrollComponent}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20 }}
            ItemSeparatorComponent={Separator}
            ListHeaderComponent={
              waitingOnSend ? (
                <View className="pb-3">
                  <TypingIndicator />
                </View>
              ) : null
            }
            ListFooterComponent={
              chat.loadingMore ? (
                <View className="py-4">
                  <ActivityIndicator color={muted} />
                </View>
              ) : null
            }
            onEndReached={() => void chat.loadMore()}
            onEndReachedThreshold={0.4}
            maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
          />
        )}
      </View>

      <KeyboardStickyView offset={{ closed: 0, opened: keyboardOffset }}>
        <View style={{ paddingBottom: safeBottom }}>
          <HomeComposer ref={composerRef} onSend={chat.send} onLayout={handleComposerLayout} />
        </View>
      </KeyboardStickyView>
    </View>
  );
}

function Separator() {
  return <View className="h-3" />;
}
