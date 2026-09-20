import { buildApiUrl } from './apiUrl';

export class ApiError extends Error {
  readonly status: number;
  // Present when the API named why, so a screen can answer in its own words
  // rather than by matching on English text.
  readonly reason?: string;
  // The refusal's code and the field it belongs to, so a form can put the
  // message beside the input that caused it.
  readonly code?: string;
  readonly field?: string;

  constructor(status: number, statusText: string, detail: ApiErrorDetail = {}) {
    super(`The API answered ${status} ${statusText}`.trim());
    this.name = 'ApiError';
    this.status = status;
    this.reason = detail.reason;
    this.code = detail.code;
    this.field = detail.field;
  }
}

type ApiErrorDetail = { reason?: string; code?: string; field?: string };

const textOrNothing = (value: unknown) => (typeof value === 'string' ? value : undefined);

async function detailFrom(response: Response): Promise<ApiErrorDetail> {
  try {
    const body = await response.clone().json();

    return {
      reason: textOrNothing(body?.reason),
      code: textOrNothing(body?.code),
      field: textOrNothing(body?.field),
    };
  } catch {
    return {};
  }
}

const NO_CONTENT = 204;

export async function requestApi<T>(
  path: string,
  init: RequestInit = {},
  fetchImplementation: typeof fetch = fetch,
): Promise<T> {
  const headers = new Headers(init.headers);

  if (init.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetchImplementation(buildApiUrl(path), {
    ...init,
    headers,
    // The session lives in a cookie the browser withholds by default, because
    // the API answers from another origin.
    credentials: 'include',
  });

  if (!response.ok) {
    throw new ApiError(response.status, response.statusText, await detailFrom(response));
  }

  if (response.status === NO_CONTENT) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
