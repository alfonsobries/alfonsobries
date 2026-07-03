# Icons

The app uses [Phosphor](https://phosphoricons.com/) icons
(`phosphor-react-native`, rendered with `react-native-svg`).

## In-app icons

Import the icon by name and set `size`, `color`, and `weight`:

```tsx
import { CaretRight } from 'phosphor-react-native';

<CaretRight size={16} weight="regular" color={tint} />;
```

Phosphor takes a `color` prop (a string), not a `className`. For theme-aware
color, pass a value from `useThemeColor` (see `src/hooks/use-theme-color.ts`).

## Native tab-bar icons

`NativeTabs` renders OS-level tab icons and can't take a Phosphor component, so
those are pre-rendered to PNGs:

- Generate them with `pnpm icons:tabs`.
- To add or change one, edit the `ICONS` map (filename → Phosphor name) in
  `scripts/generate-tab-icons.mjs`, then re-run.
- Output is square, so icons never stretch. Point `NativeTabs.Trigger.Icon` at
  the PNG with `renderingMode="template"` so the OS tints it.

## Avatar / brand art

SVGs in `assets/` for in-app use (about screens, empty states, headers…). When a
feature asks to show "their avatar", pick the person's file here.

**Family avatars** (the primary set — full-body likeness of each person):

- `me.svg` — Alfonso.
- `saida.svg` — Saida (Alfonso's wife).
- `andres.svg` — Andrés.
- `regina.svg` — Regina.

**Alfonso's personal avatar**:

- `face.svg` — Alfonso's face only (no body).

**App icon source**:

- `face-simple.svg` — flat, simplified face; the artwork the app icon is built
  from. Not a per-person avatar.
