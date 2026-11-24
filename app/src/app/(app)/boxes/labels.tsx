import * as Print from 'expo-print';
import { Stack } from 'expo-router';
import { Export, Printer } from 'phosphor-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, Share, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fetchBoxLabels, type Box } from '@/api/boxes';
import { useApiRouter } from '@/api/router';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Switch } from '@/components/ui/Switch';
import { useBoxes } from '@/hooks/use-boxes';
import { useThemeColor } from '@/hooks/use-theme-color';
import { errorMessage } from '@/lib/box-errors';
import { boxLabelsHtml, type LabelSize } from '@/lib/box-label-html';

const SIZE_OPTIONS: { value: LabelSize; label: string }[] = [
  { value: 'large', label: 'Grande · 4 por hoja' },
  { value: 'small', label: 'Chica · 9 por hoja' },
];

function BoxChoiceRow({
  box,
  checked,
  onToggle,
}: {
  box: Box;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={box.location ? `${box.name}, ${box.location}` : box.name}
      onPress={onToggle}
      className="flex-row items-center gap-3 px-4 py-2.5 active:bg-surface-selected"
    >
      <View pointerEvents="none" importantForAccessibility="no-hide-descendants">
        <Checkbox checked={checked} onChange={onToggle} />
      </View>
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-surface-selected">
        <Text className="text-xl" allowFontScaling={false}>
          {box.emoji}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="text-base text-foreground" numberOfLines={1}>
          {box.name}
        </Text>
        {box.location ? (
          <Text className="text-sm text-muted" numberOfLines={1}>
            {box.location}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

/**
 * Picks several boxes and lays their QR labels out on one letter sheet, so a
 * batch can go on white sticker paper and another on transparent paper.
 */
export default function BoxLabelsScreen() {
  const route = useApiRouter();
  const boxes = useBoxes();
  const insets = useSafeAreaInsets();
  const muted = useThemeColor('muted');
  const [selected, setSelected] = useState<string[]>([]);
  const [size, setSize] = useState<LabelSize>('large');
  const [cutLines, setCutLines] = useState(true);
  const [busy, setBusy] = useState<'print' | 'share' | null>(null);

  const all = boxes.data ?? [];
  const allSelected = all.length > 0 && selected.length === all.length;

  const handleToggle = (token: string) => {
    setSelected((current) =>
      current.includes(token) ? current.filter((entry) => entry !== token) : [...current, token],
    );
  };

  const handleToggleAll = () => {
    setSelected(allSelected ? [] : all.map((box) => box.token));
  };

  const buildHtml = async (): Promise<string> => {
    // Keep the list's order on the sheet, not the order they were tapped.
    const tokens = all.map((box) => box.token).filter((token) => selected.includes(token));
    const labels = await fetchBoxLabels(route, tokens);

    return boxLabelsHtml(labels, { size, cutLines });
  };

  const handlePrint = async () => {
    setBusy('print');
    try {
      await Print.printAsync({ html: await buildHtml() });
    } catch (error) {
      if (error instanceof Error && /cancel/i.test(error.message)) {
        return;
      }
      Alert.alert('No se pudo imprimir', errorMessage(error));
    } finally {
      setBusy(null);
    }
  };

  const handleShare = async () => {
    setBusy('share');
    try {
      const { uri } = await Print.printToFileAsync({ html: await buildHtml() });
      await Share.share({ url: uri, title: 'Etiquetas de cajas' });
    } catch (error) {
      Alert.alert('No se pudo crear el PDF', errorMessage(error));
    } finally {
      setBusy(null);
    }
  };

  const count = selected.length;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Hoja de etiquetas',
          headerRight: () =>
            all.length > 0 ? (
              <Pressable
                accessibilityRole="button"
                hitSlop={8}
                onPress={handleToggleAll}
                className="h-11 justify-center active:opacity-60"
              >
                <Text className="text-base text-primary-emphasis">
                  {allSelected ? 'Ninguna' : 'Todas'}
                </Text>
              </Pressable>
            ) : null,
        }}
      />
      <View className="flex-1 bg-background">
        <FlatList
          className="flex-1"
          contentInsetAdjustmentBehavior="automatic"
          contentContainerClassName="pb-6 pt-2"
          data={all}
          keyExtractor={(box) => box.token}
          ItemSeparatorComponent={() => <View className="ml-[96px] h-px bg-border" />}
          ListHeaderComponent={
            <View className="gap-4 px-4 pb-4">
              <SegmentedControl value={size} onChange={setSize} options={SIZE_OPTIONS} />
              <View className="flex-row items-center justify-between rounded-2xl bg-surface px-4 py-3">
                <View className="flex-1 pr-3">
                  <Text className="text-base font-medium text-foreground">Líneas de corte</Text>
                  <Text className="text-sm text-muted">
                    Apágalas si recortas a ojo o usas hoja transparente.
                  </Text>
                </View>
                <Switch
                  value={cutLines}
                  onValueChange={setCutLines}
                  accessibilityLabel="Líneas de corte"
                />
              </View>
              <Text className="px-1 text-sm text-muted">
                Elige qué cajas van en esta hoja. Haz una hoja para el papel blanco y otra para el
                transparente.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <BoxChoiceRow
              box={item}
              checked={selected.includes(item.token)}
              onToggle={() => handleToggle(item.token)}
            />
          )}
          ListEmptyComponent={
            boxes.data === null ? (
              <View className="items-center py-16">
                <ActivityIndicator color={muted} />
              </View>
            ) : (
              <Text className="px-6 py-16 text-center text-base text-muted">
                Todavía no tienes cajas.
              </Text>
            )
          }
        />

        <View
          className="gap-3 border-t border-border bg-background px-4 pt-3"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          <Button
            icon={Printer}
            fullWidth
            loading={busy === 'print'}
            disabled={count === 0 || busy !== null}
            onPress={() => void handlePrint()}
          >
            {count === 0
              ? 'Elige cajas'
              : `Imprimir ${count === 1 ? '1 etiqueta' : `${count} etiquetas`}`}
          </Button>
          <Button
            variant="secondary"
            icon={Export}
            fullWidth
            loading={busy === 'share'}
            disabled={count === 0 || busy !== null}
            onPress={() => void handleShare()}
          >
            Compartir PDF
          </Button>
        </View>
      </View>
    </>
  );
}
