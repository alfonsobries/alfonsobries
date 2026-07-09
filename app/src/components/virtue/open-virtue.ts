import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';

/**
 * Face ID gate straight into the virtue section — the section has no visible
 * unlock step, the biometric prompt IS the door. Kid-proofing, not security.
 */
export async function openVirtue(): Promise<void> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: "Confirm it's you",
    cancelLabel: 'Cancel',
  });

  if (result.success) {
    router.push('/virtue');
  }
}
