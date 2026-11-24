<!-- aikit v0.16.1 - managed file, do not edit -->

# Expo / React Native

Conventions for Expo and React Native apps.

## Platform fidelity

- Platform-native first: follow the [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines) on iOS and [Material 3](https://m3.material.io) on Android. One codebase, two native feels - when the platforms disagree, diverge per platform instead of shipping a compromise.
- Reach for the primitive that carries the system behavior before building anything: native stack and native tabs from expo-router, native search bars, form sheets with detents, @expo/ui (SwiftUI / Jetpack Compose) controls, expo-symbols, expo-haptics, platform colors.
- Imitating a native component or system transition in JS is a last resort. Preference order: built-in primitive > @expo/ui > maintained native wrapper > write an Expo Module (Swift/Kotlin). Fall back to a JS imitation only when none of those is viable, and say so explicitly instead of deciding it silently.
- Native in behavior, the app's tokens in color: keep the native control but paint its chrome through the design tokens where the platform exposes it (e.g. Android tab bar background/indicator/tint) - never ship the platform's default theme colors. On iOS, system bars stay unpainted (Liquid Glass owns them).
- Preserve the system behaviors people expect: back edge-swipe and large-title morph on iOS; predictive back, edge-to-edge and ripple (`android_ripple`, never opacity) on Android; haptics through the platform's semantic constants on both.
- Track the current design languages: Liquid Glass on iOS (no custom bar backgrounds or tints, content scrolls edge-to-edge under bars, concentric corners) and M3 Expressive on Android (color roles - never hardcoded color pairs, spring motion, 48dp touch targets).
- App icons come from the platform pipelines: layered Icon Composer icons on iOS, adaptive icons with a monochrome layer on Android.

## Styling - NativeWind

- Style with Tailwind utilities via `className` (NativeWind). Prefer semantic role tokens (`bg-background`, `text-muted-foreground`) over raw Tailwind colors or hex; an arbitrary value is fine for a deliberate one-off.
- Design tokens have one source of truth, are named by role - not by place or caller - and carry light + dark. Dark mode follows the system; a recurring color role gets a token, a one-off can use `dark:`, a data-driven color belongs in `vars()`.
- When a component won't take `className`, stop at the first that fits: forward it to the inner primitive > [`remapProps`](https://www.nativewind.dev/docs/api/remap-props) > [`cssInterop`](https://www.nativewind.dev/docs/api/css-interop) > plain `style`/`StyleSheet` (fine when none fit, or the value is computed at runtime).
- Screen-edge spacing uses the safe-area utilities (`pt-safe`, `px-safe`, `*-safe-or-[n]`), not hand-wired inset math.
- On `TextInput`, avoid line-height-bearing text classes (`text-base`, `text-sm`) - their `lineHeight` mis-positions the text vertically on iOS; use a font-size-only value (`text-[16px]`).
- `useColorScheme` comes from `nativewind`, not `react-native`.

## Plumbing

- Never hardcode API URLs or endpoints - resolve them through the project's route helpers / generated routes.
- App-side API types come from the backend's generated types; regenerate and commit them when the API changes, never hand-edit.
- All user-facing copy goes through i18n; every locale changes in the same PR. Never `t('key', { defaultValue: '...' })` - a missing key must fail loudly.
- Permissions render backend decisions (flags on the payload); never recompute permission logic client-side.
- Report significant failures to Sentry, not only the console.
