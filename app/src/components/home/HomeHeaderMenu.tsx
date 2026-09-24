import { Button as MenuButton, Host, Image as MenuIcon, Menu } from '@expo/ui/swift-ui';
import { contentShape, frame, shapes } from '@expo/ui/swift-ui/modifiers';
import { router } from 'expo-router';

import { useThemeColor } from '@/hooks/use-theme-color';

/**
 * The home chat's header menu: everything around the chat that isn't the
 * chat itself (lists, totals, categories, accounts, Telegram).
 */
export function HomeHeaderMenu() {
  const tint = useThemeColor('foreground');

  return (
    // A fixed 44pt host: `matchContents` measures late, which left the first
    // taps landing on a zero-sized view.
    <Host style={{ width: 44, height: 44 }}>
      <Menu
        label={
          <MenuIcon
            systemName="ellipsis"
            color={tint}
            size={17}
            modifiers={[frame({ width: 44, height: 44 }), contentShape(shapes.rectangle())]}
          />
        }
      >
        <MenuButton
          label="Estadísticas"
          systemImage="chart.pie"
          onPress={() => router.push('/expenses/stats')}
        />
        <MenuButton
          label="Todos los gastos"
          systemImage="list.bullet"
          onPress={() => router.push('/expenses')}
        />
        <MenuButton
          label="Agregar gasto a mano"
          systemImage="plus"
          onPress={() => router.push('/expenses/edit')}
        />
        <Menu label="Ajustes" systemImage="gearshape">
          <MenuButton
            label="Categorías"
            systemImage="square.grid.2x2"
            onPress={() => router.push('/expenses/categories')}
          />
          <MenuButton
            label="Cuentas y tarjetas"
            systemImage="creditcard"
            onPress={() => router.push('/expenses/accounts')}
          />
          <MenuButton
            label="Telegram"
            systemImage="paperplane"
            onPress={() => router.push('/telegram')}
          />
        </Menu>
      </Menu>
    </Host>
  );
}
