import { buildApiUrl } from './apiUrl';
import { ApiError, INTERNAL_ERROR_CODE, NETWORK_ERROR_CODE, isApiErrorBody } from './apiError';

type Fetcher = (url: string, init: RequestInit) => Promise<Response>;

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  baseUrl?: string;
  fetcher?: Fetcher;
};

const NO_CONTENT = 204;

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

async function toApiError(response: Response): Promise<ApiError> {
  const body = await readJson(response);

  if (isApiErrorBody(body)) {
    return new ApiError({ status: response.status, ...body });
  }

  // A proxy or a crashed server answers with something else entirely, and the
  // screen must still be able to decide what to show.
  return new ApiError({
    status: response.status,
    code: INTERNAL_ERROR_CODE,
    message: `Unexpected answer with status ${response.status}.`,
  });
}

async function send(url: string, init: RequestInit, fetcher: Fetcher): Promise<Response> {
  try {
    return await fetcher(url, init);
  } catch {
    throw new ApiError({ status: 0, code: NETWORK_ERROR_CODE, message: 'The API is unreachable.' });
  }
}

export async function requestApi<Result = unknown>(
  path: string,
  { method = 'GET', body, baseUrl, fetcher = fetch }: RequestOptions = {},
): Promise<Result> {
  const headers = new Headers({ Accept: 'application/json' });

  if (body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  // The session lives in an httpOnly cookie the API set, so every call has to
  // carry it; the client never sees the token itself.
  const response = await send(
    buildApiUrl(path, baseUrl),
    {
      method,
      headers,
      credentials: 'include',
      body: body === undefined ? undefined : JSON.stringify(body),
    },
    fetcher,
  );

  if (!response.ok) {
    throw await toApiError(response);
  }

  if (response.status === NO_CONTENT) {
    return undefined as Result;
  }

  return (await readJson(response)) as Result;
}
