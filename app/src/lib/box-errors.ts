import { isOfflineError } from '@/offline/connectivity';

/** What to tell the person when saving a box or an item fails. */
export function errorMessage(error: unknown): string {
  if (isOfflineError(error)) {
    return 'Estás sin conexión. Guardar cajas y fotos necesita internet.';
  }

  const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message;

  return message ?? 'Intenta de nuevo en un momento.';
}
