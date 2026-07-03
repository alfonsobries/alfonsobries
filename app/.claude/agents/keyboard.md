# Keyboard

Keeping the focused input visible when the on-screen keyboard opens.

- For a scrollable screen with inputs, use React Native's `ScrollView` (or
  `FlatList`) with `automaticallyAdjustKeyboardInsets` — iOS adjusts the scroll
  insets so the focused field stays visible, no library needed.
- Pair it with `keyboardDismissMode="interactive"` (drag down to dismiss,
  tracking the finger) and `keyboardShouldPersistTaps="handled"` (taps on
  buttons still fire; tapping empty space dismisses).
- That covers iOS. Android already resizes the window for the keyboard
  (`android.softwareKeyboardLayoutMode` defaults to `resize`), so the same
  scroll view adapts there too.

```tsx
<ScrollView
  automaticallyAdjustKeyboardInsets
  keyboardDismissMode="interactive"
  keyboardShouldPersistTaps="handled"
  contentInsetAdjustmentBehavior="automatic"
>
  {/* fields */}
</ScrollView>
```

- Prefer this built-in approach. Reach for `react-native-keyboard-controller`
  only when it can't cover the case — a screen with no scroll view, an
  input-accessory toolbar pinned above the keyboard, or pixel-consistent
  cross-platform animation. It's a native module, so it needs a dev-build rebuild.
