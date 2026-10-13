export type ApiErrorBody = {
  error: string;
  message: string;
  code: string;
  field?: string;
  reason?: string;
};

type ApiErrorDetails = {
  status: number;
  code: string;
  message: string;
  field?: string;
  reason?: string;
};

export const INTERNAL_ERROR_CODE = 'internal_error';
export const NETWORK_ERROR_CODE = 'network_error';

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly field?: string;
  readonly reason?: string;

  constructor({ status, code, message, field, reason }: ApiErrorDetails) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.field = field;
    this.reason = reason;
  }

  get isServerError(): boolean {
    return this.status >= 500;
  }
}

export function isApiErrorBody(value: unknown): value is ApiErrorBody {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return typeof candidate.code === 'string' && typeof candidate.message === 'string';
}
