# Design system

A living reference of the app's UI, rendered at the `/design-system` route (a
temporary "Design" tab; later it moves and is gated to admins). Build a
component once, demo it there, and reuse it everywhere.

## Principles

- **Native-first hybrid** — reach for native controls and surfaces first
  (`@expo/ui` for buttons, switches, sliders, menus, sheets; `expo-glass-effect`
  for glass). Use NativeWind + tokens for layout, display, and anything without
  a native equivalent.
- **Mobile-first**, but each piece should hold up on web too.
- **Light + dark from the start** — prefer tokens so components flip with the
  scheme; a raw value is fine for a deliberate one-off.
- **Quality over OTA convenience** — pick the best solution on its merits;
  OTA-friendliness never sways the call. If the best option needs native code (a
  `runtimeVersion` bump + rebuild), that's an acceptable cost — choose it anyway.
  Never settle for a weaker JS-only option just to keep shipping over OTA.

## Screen chrome

A screen's frame — header, title, back button, top safe area — belongs to the
navigator, not to the screen body. Hand-rolling any of it is what makes two
screens look like two apps.

- Set the title with `Stack.Screen.Title` (`large` on a tab root) and the actions
  with `headerRight`. Never draw a header row, a back control, or a page title
  inside the screen.
- A screen under a native header needs no `SafeAreaView` or `insets.top`; the
  header already clears it. Only bottom-edge chrome (composers, sheets) reserves
  an inset of its own.
- Form sheets have no header, so their body goes in `Sheet` — the grabber
  clearance, side padding and home-indicator gap live there once.

## Structure

- `src/app/design-system/` — the catalog `index` plus one sub-page per category
  (Foundations, Buttons, Inputs, Feedback, Navigation…). Each sub-page renders
  the components live with their variants and states so they can be tried.
- `src/components/ui/` — the reusable primitives the sub-pages show. Shared
  primitives keep plain names (`Button`, `Card`).

## Adding a component

1. Build the primitive in `src/components/ui/`.
2. Demo it on its category sub-page with every variant and state.
3. If the category is new, add a row for it in the catalog `index`.
