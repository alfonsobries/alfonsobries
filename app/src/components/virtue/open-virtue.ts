import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';

/**
 * The virtue section hides behind Face ID — kid-proofing, not security. One
 * successful scan unlocks it for the rest of the app session, so the summary
 * card and the section don't keep re-prompting.
 */
let unlocked = false;

export function isVirtueUnlocked(): boolean {
  return unlocked;
}

export async function unlockVirtue(): Promise<boolean> {
  if (unlocked) {
    return true;
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: "Confirm it's you",
    cancelLabel: 'Cancel',
  });

  unlocked = result.success;

  return result.success;
}

export async function openVirtue(): Promise<void> {
  if (await unlockVirtue()) {
    router.push('/virtue');
  }
}
