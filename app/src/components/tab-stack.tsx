import { Stack } from 'expo-router';

/**
 * The navigation stack inside one native tab. It gives every tab root a native
 * header, so screens set their title with `Stack.Screen.Title` instead of
 * drawing one — and never reserve the top safe area themselves.
 */
export function TabStack() {
  return <Stack />;
}
