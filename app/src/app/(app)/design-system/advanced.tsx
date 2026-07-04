import { Stack } from 'expo-router';
import { GlobeHemisphereWest } from 'phosphor-react-native';
import { ReactNode, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { pickEmoji } from '@/components/ui/emoji-keyboard';
import { Select } from '@/components/ui/Select';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-3">
      <Text className="text-xs font-semibold uppercase tracking-wider text-muted">{title}</Text>
      {children}
    </View>
  );
}

const COUNTRIES = [
  { value: 'ar', label: '🇦🇷 Argentina' },
  { value: 'au', label: '🇦🇺 Australia' },
  { value: 'at', label: '🇦🇹 Austria' },
  { value: 'be', label: '🇧🇪 Bélgica' },
  { value: 'bo', label: '🇧🇴 Bolivia' },
  { value: 'br', label: '🇧🇷 Brasil' },
  { value: 'ca', label: '🇨🇦 Canadá' },
  { value: 'cl', label: '🇨🇱 Chile' },
  { value: 'cn', label: '🇨🇳 China' },
  { value: 'co', label: '🇨🇴 Colombia' },
  { value: 'kr', label: '🇰🇷 Corea del Sur' },
  { value: 'cr', label: '🇨🇷 Costa Rica' },
  { value: 'cu', label: '🇨🇺 Cuba' },
  { value: 'dk', label: '🇩🇰 Dinamarca' },
  { value: 'ec', label: '🇪🇨 Ecuador' },
  { value: 'eg', label: '🇪🇬 Egipto' },
  { value: 'sv', label: '🇸🇻 El Salvador' },
  { value: 'ae', label: '🇦🇪 Emiratos Árabes Unidos' },
  { value: 'es', label: '🇪🇸 España' },
  { value: 'us', label: '🇺🇸 Estados Unidos' },
  { value: 'fi', label: '🇫🇮 Finlandia' },
  { value: 'fr', label: '🇫🇷 Francia' },
  { value: 'gr', label: '🇬🇷 Grecia' },
  { value: 'gt', label: '🇬🇹 Guatemala' },
  { value: 'hn', label: '🇭🇳 Honduras' },
  { value: 'in', label: '🇮🇳 India' },
  { value: 'id', label: '🇮🇩 Indonesia' },
  { value: 'ie', label: '🇮🇪 Irlanda' },
  { value: 'is', label: '🇮🇸 Islandia' },
  { value: 'it', label: '🇮🇹 Italia' },
  { value: 'jp', label: '🇯🇵 Japón' },
  { value: 'mx', label: '🇲🇽 México' },
  { value: 'ni', label: '🇳🇮 Nicaragua' },
  { value: 'no', label: '🇳🇴 Noruega' },
  { value: 'nz', label: '🇳🇿 Nueva Zelanda' },
  { value: 'nl', label: '🇳🇱 Países Bajos' },
  { value: 'pa', label: '🇵🇦 Panamá' },
  { value: 'py', label: '🇵🇾 Paraguay' },
  { value: 'pe', label: '🇵🇪 Perú' },
  { value: 'pl', label: '🇵🇱 Polonia' },
  { value: 'pt', label: '🇵🇹 Portugal' },
  { value: 'gb', label: '🇬🇧 Reino Unido' },
  { value: 'cz', label: '🇨🇿 República Checa' },
  { value: 'do', label: '🇩🇴 República Dominicana' },
  { value: 'se', label: '🇸🇪 Suecia' },
  { value: 'ch', label: '🇨🇭 Suiza' },
  { value: 'th', label: '🇹🇭 Tailandia' },
  { value: 'tr', label: '🇹🇷 Turquía' },
  { value: 'uy', label: '🇺🇾 Uruguay' },
  { value: 've', label: '🇻🇪 Venezuela' },
  { value: 'vn', label: '🇻🇳 Vietnam' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const SNACKS = [
  { value: 'palomitas', label: '🍿 Palomitas' },
  { value: 'churros', label: '🥖 Churros' },
  { value: 'fruta', label: '🍉 Fruta picada' },
  { value: 'elote', label: '🌽 Elote' },
  { value: 'paleta', label: '🍭 Paleta' },
];

export default function Advanced() {
  const [picked, setPicked] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>('mx');
  const [priority, setPriority] = useState<string | null>('medium');
  const [snack, setSnack] = useState<string | null>(null);

  async function handlePick() {
    const emoji = await pickEmoji();
    if (emoji) {
      setPicked(emoji);
    }
  }

  return (
    <>
      <Stack.Screen.Title large>Advanced</Stack.Screen.Title>
      <ScrollView
        className="flex-1 bg-background"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-8 p-4"
      >
        <Section title="Select · searchable, A–Z index">
          <Text className="text-sm text-muted">
            Long list opens the settings-style native sheet: search, letter sections, side index.
            Preselected value shows a checkmark.
          </Text>
          <Select
            label="Country"
            icon={GlobeHemisphereWest}
            options={COUNTRIES}
            value={country}
            onChange={setCountry}
            searchPlaceholder="Search country"
          />
        </Section>

        <Section title="Select · short list, no search">
          <Text className="text-sm text-muted">
            Few options: plain native list, search and index off.
          </Text>
          <Select
            label="Priority"
            options={PRIORITIES}
            value={priority}
            onChange={setPriority}
            searchable={false}
          />
        </Section>

        <Section title="Select · empty placeholder">
          <Text className="text-sm text-muted">No preselected value until picked.</Text>
          <Select
            label="Snack"
            placeholder="Pick a snack…"
            options={SNACKS}
            value={snack}
            onChange={setSnack}
            searchable={false}
          />
        </Section>

        <Section title="Emoji picker">
          <Text className="text-sm text-muted">
            Opens the native iOS emoji keyboard and returns the picked emoji.
          </Text>
          <View className="flex-row items-center gap-3">
            <Button onPress={handlePick}>Pick an emoji</Button>
            <View className="size-12 items-center justify-center rounded-xl bg-surface-selected">
              <Text className="text-2xl">{picked ?? '🫥'}</Text>
            </View>
          </View>
        </Section>
      </ScrollView>
    </>
  );
}
