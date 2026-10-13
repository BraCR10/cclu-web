import { describe, it, expect } from 'vitest';
import { requestApi } from '@/shared/api/apiClient';
import { ApiError } from '@/shared/api/apiError';

type FetchCall = { url: string; init: RequestInit };

function fakeFetch(response: Response) {
  const calls: FetchCall[] = [];
  const fetcher = async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return response;
  };

  return { calls, fetcher };
}

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function failureOf(work: Promise<unknown>) {
  try {
    await work;
  } catch (error) {
    return error;
  }

  throw new Error('The request was expected to fail and did not.');
}

const options = { baseUrl: 'http://api.test' };

describe('requestApi', () => {
  it('returns the parsed body of a successful answer', async () => {
    const { fetcher } = fakeFetch(jsonResponse(200, { name: 'Café' }));

    await expect(requestApi('/members/me', { ...options, fetcher })).resolves.toEqual({
      name: 'Café',
    });
  });

  it('returns nothing for an answer without content', async () => {
    const { fetcher } = fakeFetch(new Response(null, { status: 204 }));

    await expect(requestApi('/auth/logout', { ...options, fetcher })).resolves.toBeUndefined();
  });

  it('sends the session cookie and a JSON body', async () => {
    const { calls, fetcher } = fakeFetch(new Response(null, { status: 204 }));

    await requestApi('/members/me', { ...options, fetcher, method: 'PATCH', body: { a: 1 } });

    expect(calls[0].url).toBe('http://api.test/members/me');
    expect(calls[0].init.method).toBe('PATCH');
    expect(calls[0].init.credentials).toBe('include');
    expect(calls[0].init.body).toBe('{"a":1}');
    expect(new Headers(calls[0].init.headers).get('Content-Type')).toBe('application/json');
  });

  it('turns an error answer into an ApiError with the shape the API sent', async () => {
    const { fetcher } = fakeFetch(
      jsonResponse(400, {
        error: 'ValidationError',
        message: 'Too long.',
        code: 'too_long',
        field: 'phone',
      }),
    );

    const error = await failureOf(requestApi('/members', { ...options, fetcher }));

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 400,
      code: 'too_long',
      field: 'phone',
      message: 'Too long.',
    });
  });

  it('keeps the reason an error carries', async () => {
    const { fetcher } = fakeFetch(
      jsonResponse(409, {
        error: 'X',
        message: 'Decided.',
        code: 'already_decided',
        reason: 'approved',
      }),
    );

    const error = await failureOf(requestApi('/admin/x', { ...options, fetcher }));

    expect(error).toMatchObject({ code: 'already_decided', reason: 'approved' });
  });

  it('answers internal_error when an error answer is not the API shape', async () => {
    const { fetcher } = fakeFetch(new Response('<html>Bad gateway</html>', { status: 502 }));

    const error = await failureOf(requestApi('/members', { ...options, fetcher }));

    expect(error).toMatchObject({ status: 502, code: 'internal_error' });
  });

  it('answers network_error when the API cannot be reached', async () => {
    const fetcher = async () => {
      throw new TypeError('Failed to fetch');
    };

    const error = await failureOf(requestApi('/members', { ...options, fetcher }));

    expect(error).toMatchObject({ status: 0, code: 'network_error' });
  });
});
