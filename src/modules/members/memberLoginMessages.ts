import { ApiError } from '@/shared/api/request';
import { REFUSAL_REASONS } from './api/memberSession';

// One message for a wrong password and for an address that is not an account.
// Telling them apart would turn this form into a way of asking the chamber who
// is affiliated with it.
export const MESSAGES = {
  invalid: 'Correo o contraseña incorrectos.',
  pending:
    'Su solicitud de afiliación todavía está en revisión. Le escribiremos al correo que indicó cuando haya una respuesta.',
  rejected:
    'Su solicitud de afiliación fue rechazada. Revise el correo que le enviamos: incluye el motivo y un enlace para volver a enviarla.',
  suspended: 'Su cuenta está suspendida. Comuníquese con la Cámara para continuar.',
  tooManyAttempts: 'Demasiados intentos. Espere unos minutos e intente de nuevo.',
  unavailable: 'No fue posible iniciar sesión. Intente de nuevo en unos momentos.',
};

const BY_REASON: Record<string, string> = {
  [REFUSAL_REASONS.APPLICATION_PENDING]: MESSAGES.pending,
  [REFUSAL_REASONS.APPLICATION_REJECTED]: MESSAGES.rejected,
  [REFUSAL_REASONS.ACCOUNT_SUSPENDED]: MESSAGES.suspended,
};

export function messageFor(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return MESSAGES.unavailable;
  }

  if (error.status === 401) {
    return MESSAGES.invalid;
  }

  if (error.status === 429) {
    return MESSAGES.tooManyAttempts;
  }

  // Only a 403 carries a reason, and the API only sends one once the password
  // was right, so explaining the state here reveals nothing a stranger could ask
  // for.
  if (error.status === 403 && error.reason !== undefined) {
    return BY_REASON[error.reason] ?? MESSAGES.unavailable;
  }

  return MESSAGES.unavailable;
}
