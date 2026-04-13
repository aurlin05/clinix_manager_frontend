// → src/app/core/utils/error.utils.ts

/**
 * Extrait le message d'erreur lisible depuis une réponse HttpErrorResponse.
 *
 * Format backend ApiError :
 * {
 *   status:  number,
 *   error:   string,
 *   message: string,        ← message principal
 *   details: string[]       ← erreurs de validation champ par champ
 * }
 */
export function extractErrorMessage(
  err: any,
  fallback = 'Une erreur est survenue. Veuillez réessayer.'
): string {
  // Erreurs de validation : détails champ par champ
  if (err?.error?.details?.length) {
    return (err.error.details as string[]).join(' • ');
  }
  // Message principal du backend
  if (err?.error?.message) {
    return err.error.message;
  }
  return fallback;
}
