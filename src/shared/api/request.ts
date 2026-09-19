import { buildApiUrl } from './apiUrl';

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, statusText: string) {
    super(`The API answered ${status} ${statusText}`.trim());
    this.name = 'ApiError';
    this.status = status;
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
    throw new ApiError(response.status, response.statusText);
  }

  if (response.status === NO_CONTENT) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
