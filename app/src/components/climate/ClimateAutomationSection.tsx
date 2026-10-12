import { House, MapPin, NavigationArrow } from 'phosphor-react-native';
import { Text, View } from 'react-native';

import type { ClimateAutomation } from '@/api/climate';
import { SettingsRow } from '@/components/settings/SettingsRow';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { Switch } from '@/components/ui/Switch';
import { type PresencePermission } from '@/lib/home-presence';

type ClimateAutomationSectionProperties = {
  automation: ClimateAutomation;
  permission: PresencePermission | null;
  savingHome: boolean;
  onToggle: (enabled: boolean) => void;
  onSetHome: () => void;
  onRequestPermission: () => void;
};

const PRESENCE_LABEL = {
  home: 'En casa',
  away: 'Fuera',
} as const;

export function ClimateAutomationSection({
  automation,
  permission,
  savingHome,
  onToggle,
  onSetHome,
  onRequestPermission,
}: ClimateAutomationSectionProperties) {
  const pending = automation.switched_off.length;

  return (
    <View className="gap-6">
      <SettingsSection
        title="Cuando no hay nadie en casa"
        footer="Si los dos llevan 5 minutos fuera, apago los aires que estén prendidos. Cuando uno regresa, prendo esos mismos con su ajuste. Si alguien prende uno mientras están fuera, se queda prendido."
      >
        <View className="flex-row items-center gap-3 px-4 py-3">
          <Text className="flex-1 text-base text-foreground">Apagar y volver a prender solos</Text>
          <Switch
            accessibilityLabel="Apagar y volver a prender solos"
            value={automation.enabled}
            onValueChange={onToggle}
          />
        </View>
        {automation.people.map((person) => (
          <SettingsRow
            key={person.member}
            label={person.name.split(' ')[0]}
            icon={House}
            detail={person.presence ? PRESENCE_LABEL[person.presence] : 'Sin ubicación'}
          />
        ))}
      </SettingsSection>

      {pending > 0 ? (
        <View className="rounded-2xl bg-surface px-4 py-3">
          <Text className="text-sm text-foreground">
            {pending === 1
              ? 'Apagué 1 aire porque no había nadie. Se prende cuando alguien llegue.'
              : `Apagué ${pending} aires porque no había nadie. Se prenden cuando alguien llegue.`}
          </Text>
        </View>
      ) : null}

      <SettingsSection
        title="Este iPhone"
        footer={
          permission === 'always'
            ? 'Este iPhone avisa cuando entras o sales de la casa, aunque la app esté cerrada.'
            : 'Para saber si estás en casa con la app cerrada, la ubicación tiene que estar en "Siempre". Cada uno lo activa en su iPhone.'
        }
      >
        <SettingsRow
          label="Ubicación de la casa"
          icon={MapPin}
          detail={automation.home ? 'Guardada' : 'Sin guardar'}
          loading={savingHome}
          onPress={onSetHome}
          showChevron
        />
        <SettingsRow
          label="Ubicación en segundo plano"
          icon={NavigationArrow}
          detail={
            permission === 'always' ? 'Siempre' : permission === 'denied' ? 'Desactivada' : 'Falta'
          }
          onPress={permission === 'always' ? undefined : onRequestPermission}
          showChevron={permission !== 'always'}
        />
      </SettingsSection>
    </View>
  );
}
