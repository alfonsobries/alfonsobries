# NativeWind

Styling for the Expo app (NativeWind v4 — Tailwind classes in React Native).

## Styling

- Prefer styling with Tailwind utilities via `className`.
- Prefer semantic color tokens (`bg-background`, `text-foreground`,
  `text-muted`, `bg-surface`, `bg-primary`…) and the brand scales (`gold`,
  `neutral`, `success`, `warning`, `danger`) over raw Tailwind colors or hex —
  an arbitrary value is fine for a deliberate one-off.
- `primary` is a light fill color — safe as a background, not as on-surface
  text or icon color. Use `primary-emphasis` for links, icons, and any text
  color that needs to read against `background`/`surface`.
- Colors have one source of truth: `tokens.json` at the app root. Edit it, then
  run `pnpm tokens:build` to regenerate `src/global.css`, `tailwind.tokens.cjs`,
  and `src/constants/colors.gen.ts` — don't hand-edit the generated blocks.
- On a `TextInput`, don't use line-height-bearing text classes (`text-base`,
  `text-sm`…): the `lineHeight` they set mis-positions the text vertically on
  iOS. Use a font-size-only value instead — `text-[16px]`.
- Dark mode is automatic and comes from the system
  ([docs](https://www.nativewind.dev/docs/core-concepts/dark-mode)) — tokens
  carry light + dark and flip via `@media (prefers-color-scheme)`. Prefer a
  universal token for any color with
  a recurring role, especially in reusable pieces (cards, inputs, badges…). A
  one-off can use `dark:`; a data-driven color belongs in `vars()`.
- Name tokens by role, not by place or caller.

## When a component won't take `className`

Stop at the first that fits:

1. **Forward it** — accept `className`, pass it to the inner RN primitive.
2. **[`remapProps`](https://www.nativewind.dev/docs/api/remap-props)** —
   third-party component with style props:
   `remapProps(C, { buttonClass: 'buttonStyle', labelClass: 'labelStyle' })`.
3. **[`cssInterop`](https://www.nativewind.dev/docs/api/css-interop)** — leaf
   native component needing class→style resolution or a style routed to a
   non-style prop (`TextInput` → `placeholderTextColor`). Heavier; only when
   `remapProps` isn't enough.

Plain `StyleSheet` / `style` is also fine — when none of the above fit, when
they'd leave the component too patched / unreadable, or when a value is computed
at runtime (e.g. padding derived from screen width). Native props that can't
take a `className` at all (icon `color`, native tab bar colors, `ActivityIndicator`)
resolve their color via `useThemeColor` (`src/hooks/use-theme-color.ts`) instead.

## Safe-area insets

For screen-edge spacing use NativeWind's safe-area utilities — `p-safe`,
`px-safe`, `pt-safe`/`pb-safe`, `inset-safe`, `h-screen-safe`, plus the
`*-safe-or-[n]` (max fallback) and `*-safe-offset-[n]` variants. They map to the
device insets from
[`react-native-safe-area-context`](https://github.com/AppAndFlow/react-native-safe-area-context).
[Docs](https://www.nativewind.dev/docs/tailwind/new-concepts/safe-area-insets).

## Theming

- **`vars()`** for runtime values that can't be static tokens (e.g. a brand
  accent from data): set on a wrapper `style`, read below with `text-[--x]`.
- **`useColorScheme` from `nativewind`** (not `react-native`) to read/set the
  scheme: `setColorScheme('system' | 'light' | 'dark')`, `toggleColorScheme`.
  Today the scheme is system-driven; a manual toggle means `darkMode: 'class'`.
