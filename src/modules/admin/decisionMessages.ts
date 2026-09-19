import { ApiError } from '@/shared/api/request';

export const DECISION_MESSAGES = {
  alreadyDecided: 'Otra persona ya decidió esta solicitud. La lista se actualizó.',
  gone: 'Esta solicitud ya no existe. La lista se actualizó.',
  reasonRequired: 'Escriba el motivo del rechazo.',
  notAllowed: 'Su sesión no tiene permiso para decidir sobre solicitudes.',
  unavailable: 'No fue posible completar la decisión. Intente de nuevo en unos momentos.',
  listUnavailable: 'No fue posible cargar las solicitudes pendientes.',
};

// A decision that failed because someone else got there first is not an error
// the administrator caused, so it reads as news rather than as a fault.
export function decisionMessageFor(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return DECISION_MESSAGES.unavailable;
  }

  if (error.status === 409) {
    return DECISION_MESSAGES.alreadyDecided;
  }

  if (error.status === 404) {
    return DECISION_MESSAGES.gone;
  }

  if (error.status === 400) {
    return DECISION_MESSAGES.reasonRequired;
  }

  if (error.status === 403) {
    return DECISION_MESSAGES.notAllowed;
  }

  return DECISION_MESSAGES.unavailable;
}

// Both of these mean the list no longer matches the database, so the screen
// reloads it instead of leaving a card that cannot be acted on.
export function decisionLeftListStale(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 409 || error.status === 404);
}
