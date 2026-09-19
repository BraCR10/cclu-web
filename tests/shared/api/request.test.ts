import { describe, it, expect, vi } from 'vitest';
import { ApiError, requestApi } from '@/shared/api/request';

function respondWith(body: unknown, status = 200, statusText = 'OK') {
  return vi.fn<typeof fetch>(async () =>
    status === 204
      ? new Response(null, { status, statusText })
      : new Response(JSON.stringify(body), { status, statusText }),
  );
}

describe('requestApi', () => {
  it('lets the browser attach the session cookie, which it withholds by default', async () => {
    const fetchImplementation = respondWith({ id: 'abc', role: 'agremiado' });

    await requestApi('/api/auth/me', {}, fetchImplementation);

    expect(fetchImplementation.mock.calls[0][1]).toMatchObject({ credentials: 'include' });
  });

  it('returns what the API answered', async () => {
    const fetchImplementation = respondWith({ id: 'abc', role: 'agremiado' });

    await expect(requestApi('/api/auth/me', {}, fetchImplementation)).resolves.toEqual({
      id: 'abc',
      role: 'agremiado',
    });
  });

  it('reports the status when the API refuses, instead of returning nothing', async () => {
    const fetchImplementation = respondWith({}, 401, 'Unauthorized');

    await expect(requestApi('/api/auth/me', {}, fetchImplementation)).rejects.toMatchObject({
      name: 'ApiError',
      status: 401,
    });
  });

  it('survives an answer that carries no body', async () => {
    const fetchImplementation = respondWith(null, 204, 'No Content');

    await expect(
      requestApi('/api/auth/logout', { method: 'POST' }, fetchImplementation),
    ).resolves.toBeUndefined();
  });

  it('declares JSON only when it is actually sending something', async () => {
    const withBody = respondWith({});
    const withoutBody = respondWith({});

    await requestApi('/api/x', { method: 'POST', body: '{}' }, withBody);
    await requestApi('/api/x', {}, withoutBody);

    const sent = withBody.mock.calls[0][1]?.headers as Headers;
    const read = withoutBody.mock.calls[0][1]?.headers as Headers;

    expect(sent.get('Content-Type')).toBe('application/json');
    expect(read.get('Content-Type')).toBeNull();
  });

  it('carries the status on the error it throws', () => {
    expect(new ApiError(403, 'Forbidden')).toBeInstanceOf(Error);
    expect(new ApiError(403, 'Forbidden').status).toBe(403);
  });
});
