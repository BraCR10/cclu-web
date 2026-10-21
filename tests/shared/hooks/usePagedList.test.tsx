import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePagedList, type PagedQuery } from '@/shared/hooks/usePagedList';

type Filters = { status: 'pending' | 'done' };
type List = { label: string };

const readCalls: PagedQuery<Filters>[] = [];

function read(query: PagedQuery<Filters>): Promise<List> {
  readCalls.push(query);
  return Promise.resolve({ label: `${query.status}-${query.search}-${query.page}` });
}

function failingRead(): Promise<List> {
  return Promise.reject(new Error('offline'));
}

async function settle() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0);
  });
}

function renderList() {
  return renderHook(() => usePagedList<Filters, List>(read, { status: 'pending' }));
}

describe('usePagedList', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    readCalls.length = 0;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('reads the first page with the initial filters and no search', async () => {
    const { result } = renderList();

    await settle();

    expect(readCalls[0]).toEqual({ status: 'pending', search: '', page: 1 });
    expect(result.current.list).toEqual({ label: 'pending--1' });
    expect(result.current.loading).toBe(false);
  });

  it('goes back to the first page when a filter changes', async () => {
    const { result } = renderList();
    await settle();

    act(() => result.current.showPage(3));
    await settle();
    act(() => result.current.filter({ status: 'done' }));
    await settle();

    expect(result.current.query).toEqual({ status: 'done', search: '', page: 1 });
  });

  it('waits for a pause in typing before searching', async () => {
    const { result } = renderList();
    await settle();

    act(() => result.current.search('pan'));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
    expect(result.current.query.search).toBe('');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(result.current.query.search).toBe('pan');
  });

  it('keeps the previous page on screen while the next one loads', async () => {
    const { result } = renderList();
    await settle();

    act(() => result.current.showPage(2));

    expect(result.current.loading).toBe(true);
    expect(result.current.list).toEqual({ label: 'pending--1' });
  });

  it('reads the same query again on reload', async () => {
    const { result } = renderList();
    await settle();

    act(() => result.current.reload());
    await settle();

    expect(readCalls).toHaveLength(2);
    expect(readCalls[1]).toEqual(readCalls[0]);
  });

  it('reports a failed read rather than an empty list', async () => {
    const { result } = renderHook(() =>
      usePagedList<Filters, List>(failingRead, { status: 'pending' }),
    );

    await settle();

    expect(result.current.failed).toBe(true);
    expect(result.current.list).toBeNull();
  });
});
