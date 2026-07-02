import { Stack } from 'expo-router';

export default function DesignSystemLayout() {
  return (
    <Stack screenOptions={{ headerLargeTitle: true }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="sheet"
        options={{
          presentation: 'formSheet',
          sheetAllowedDetents: [0.5, 1],
          sheetGrabberVisible: true,
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="sheet-fit"
        options={{
          presentation: 'formSheet',
          sheetAllowedDetents: [0.4],
          sheetGrabberVisible: true,
          headerShown: false,
        }}
      />
    </Stack>
  );
}
