import { Button as MenuButton, Host, Image as MenuIcon, Menu } from '@expo/ui/swift-ui';
import { router } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';

import type { KidMember } from '@/api/behaviors';
import { useThemeColor } from '@/hooks/use-theme-color';

// The native iOS pull-down menu on a kid's profile header — the parents'
// entry point to their behaviors. "Add" asks for Face ID right here since it
// skips the manage screen's own gate.
export function KidHeaderMenu({ member }: { member: KidMember }) {
  const tint = useThemeColor('foreground');

  async function handleAdd(): Promise<void> {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Confirm it's you to add a behavior",
      cancelLabel: 'Cancel',
    });

    if (result.success) {
      router.push({ pathname: '/behaviors/edit', params: { member } });
    }
  }

  return (
    <Host matchContents>
      {/* Plain "…" tinted like the other header items — the default renders
          as a blue circled glyph that doesn't match the native chrome. */}
      <Menu label={<MenuIcon systemName="ellipsis" color={tint} size={17} />}>
        <MenuButton label="Add behavior" systemImage="plus" onPress={() => void handleAdd()} />
        <MenuButton
          label="Manage behaviors"
          systemImage="slider.horizontal.3"
          onPress={() => router.push({ pathname: '/behaviors/manage', params: { member } })}
        />
      </Menu>
    </Host>
  );
}
