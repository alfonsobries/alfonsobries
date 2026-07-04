import { Button as MenuButton, Host, Image as MenuIcon, Menu } from '@expo/ui/swift-ui';
import { contentShape, frame, shapes } from '@expo/ui/swift-ui/modifiers';
import { router } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';

import type { KidMember } from '@/api/behaviors';
import { useThemeColor } from '@/hooks/use-theme-color';

// The native iOS pull-down menu on a kid's profile header — the parents'
// hub for chores, behaviors and rewards, organized as native submenus.
// "Add" entries ask for Face ID right here since they skip the manage
// screens' own gates.
export function KidHeaderMenu({ member }: { member: KidMember }) {
  const tint = useThemeColor('foreground');

  async function withFaceId(prompt: string, action: () => void): Promise<void> {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: prompt,
      cancelLabel: 'Cancel',
    });

    if (result.success) {
      action();
    }
  }

  return (
    // A fixed 44pt host: `matchContents` measures late, which left the first
    // taps landing on a zero-sized view.
    <Host style={{ width: 44, height: 44 }}>
      {/* Plain "…" tinted like the other header items — the default renders
          as a blue circled glyph that doesn't match the native chrome. The
          frame + contentShape make the whole 44pt square hit-testable, not
          just the tiny glyph. */}
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
        <Menu label="Chores" systemImage="checkmark.circle">
          <MenuButton
            label="Add chore"
            systemImage="plus"
            onPress={() =>
              void withFaceId("Confirm it's you to add a chore", () =>
                router.push({ pathname: '/chores/edit', params: { member } }),
              )
            }
          />
          <MenuButton
            label="Manage chores"
            systemImage="slider.horizontal.3"
            onPress={() => router.push({ pathname: '/chores/manage', params: { member } })}
          />
        </Menu>

        <Menu label="Behaviors" systemImage="hand.raised">
          <MenuButton
            label="Add behavior"
            systemImage="plus"
            onPress={() =>
              void withFaceId("Confirm it's you to add a behavior", () =>
                router.push({ pathname: '/behaviors/edit', params: { member } }),
              )
            }
          />
          <MenuButton
            label="Manage behaviors"
            systemImage="slider.horizontal.3"
            onPress={() => router.push({ pathname: '/behaviors/manage', params: { member } })}
          />
        </Menu>

        <Menu label="Rewards" systemImage="gift">
          <MenuButton
            label="Add reward"
            systemImage="plus"
            onPress={() =>
              void withFaceId("Confirm it's you to add a reward", () =>
                router.push({ pathname: '/rewards/edit', params: { member } }),
              )
            }
          />
          <MenuButton
            label="Manage rewards"
            systemImage="slider.horizontal.3"
            onPress={() => router.push({ pathname: '/rewards/manage', params: { member } })}
          />
        </Menu>
      </Menu>
    </Host>
  );
}
