import { ApiError } from '@/shared/api/apiError';

export const GENERIC_ERROR_KEY = 'generic';

export type ErrorDisplay =
  | { placement: 'field'; field: string; messageKey: string }
  | { placement: 'toast'; messageKey: string };

function messageKeyFor(error: ApiError, isKnownCode: (code: string) => boolean): string {
  if (error.isServerError || !isKnownCode(error.code)) {
    return GENERIC_ERROR_KEY;
  }

  return error.code;
}

export function decideErrorDisplay(
  error: unknown,
  isKnownCode: (code: string) => boolean,
): ErrorDisplay {
  if (!(error instanceof ApiError)) {
    return { placement: 'toast', messageKey: GENERIC_ERROR_KEY };
  }

  const messageKey = messageKeyFor(error, isKnownCode);

  if (error.field !== undefined && !error.isServerError) {
    return { placement: 'field', field: error.field, messageKey };
  }

  return { placement: 'toast', messageKey };
}
