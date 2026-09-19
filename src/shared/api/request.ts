import { buildApiUrl } from './apiUrl';

export class ApiError extends Error {
  readonly status: number;
  // Present when the API named why, so a screen can answer in its own words
  // rather than by matching on English text.
  readonly reason?: string;

  constructor(status: number, statusText: string, reason?: string) {
    super(`The API answered ${status} ${statusText}`.trim());
    this.name = 'ApiError';
    this.status = status;
    this.reason = reason;
  }
}

async function reasonFrom(response: Response): Promise<string | undefined> {
  try {
    const body = await response.clone().json();

    return typeof body?.reason === 'string' ? body.reason : undefined;
  } catch {
    return undefined;
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
    throw new ApiError(response.status, response.statusText, await reasonFrom(response));
  }

  if (response.status === NO_CONTENT) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
