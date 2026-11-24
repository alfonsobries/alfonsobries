import * as Print from 'expo-print';
import { Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Export, Globe, Printer } from 'phosphor-react-native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Share, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { fetchBoxLabel, type BoxWithLabel } from '@/api/boxes';
import { useApiRouter } from '@/api/router';
import { Button } from '@/components/ui/Button';
import { useThemeColor } from '@/hooks/use-theme-color';
import { boxLabelsHtml } from '@/lib/box-label-html';
import { cacheKeys } from '@/offline/store';
import { useCachedResource } from '@/offline/use-cached-resource';

const QR_SIZE = 232;

/**
 * A box's label: the QR to print and stick on it. Scanning it opens the box
 * in the app when installed, or a read-only web page on any other phone.
 */
export default function BoxLabelScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const route = useApiRouter();
  const muted = useThemeColor('muted');
  const [busy, setBusy] = useState<'print' | 'share' | null>(null);

  const fetcher = useCallback(() => fetchBoxLabel(route, token), [route, token]);
  const label = useCachedResource<BoxWithLabel>(cacheKeys.boxLabel(token), fetcher);
  const { refresh } = label;

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const box = label.data;

  const handlePrint = async () => {
    if (!box) {
      return;
    }

    setBusy('print');
    try {
      await Print.printAsync({ html: boxLabelsHtml([box], { size: 'large', cutLines: true }) });
    } catch {
      // Dismissing the print dialog rejects too; nothing to report.
    } finally {
      setBusy(null);
    }
  };

  const handleShare = async () => {
    if (!box) {
      return;
    }

    setBusy('share');
    try {
      const { uri } = await Print.printToFileAsync({
        html: boxLabelsHtml([box], { size: 'large', cutLines: true }),
      });
      await Share.share({ url: uri, title: `Etiqueta: ${box.name}` });
    } catch {
      Alert.alert('No se pudo preparar la etiqueta', 'Intenta de nuevo en un momento.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Etiqueta' }} />
      <ScrollView
        className="flex-1 bg-background"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-6 px-4 pb-16 pt-4"
      >
        {box === null ? (
          <View className="items-center py-24">
            {label.status === 'error' ? (
              <Text className="px-6 text-center text-base text-muted">
                Necesito internet la primera vez que abres la etiqueta de esta caja.
              </Text>
            ) : (
              <ActivityIndicator color={muted} />
            )}
          </View>
        ) : (
          <>
            <View className="items-center gap-4 rounded-[32px] bg-white px-6 py-7">
              <View className="max-w-full flex-row items-center gap-2.5">
                <Text className="text-4xl" allowFontScaling={false}>
                  {box.emoji}
                </Text>
                <Text className="shrink text-2xl font-extrabold text-[#1f1a12]" numberOfLines={2}>
                  {box.name}
                </Text>
              </View>
              {box.location ? (
                <Text className="-mt-2 text-base text-[#6f6250]">{box.location}</Text>
              ) : null}
              <View
                accessible
                accessibilityRole="image"
                accessibilityLabel={`Código QR de ${box.name}`}
              >
                <SvgXml xml={box.qr_svg} width={QR_SIZE} height={QR_SIZE} />
              </View>
              <Text className="text-sm text-[#6f6250]">Escanea para ver qué hay dentro</Text>
            </View>

            <View className="gap-3">
              <Button
                icon={Printer}
                fullWidth
                loading={busy === 'print'}
                disabled={busy !== null}
                onPress={() => void handlePrint()}
              >
                Imprimir
              </Button>
              <Button
                variant="secondary"
                icon={Export}
                fullWidth
                loading={busy === 'share'}
                disabled={busy !== null}
                onPress={() => void handleShare()}
              >
                Compartir PDF
              </Button>
              <Button
                variant="ghost"
                icon={Globe}
                fullWidth
                onPress={() => void WebBrowser.openBrowserAsync(box.public_url)}
              >
                Ver lo que ve quien la escanea
              </Button>
            </View>
          </>
        )}
      </ScrollView>
    </>
  );
}
