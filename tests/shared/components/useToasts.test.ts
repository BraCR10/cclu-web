import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useToasts } from '@/shared/components/useToasts';

describe('useToasts', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('keeps every announcement apart even when the text repeats', () => {
    const { result } = renderHook(() => useToasts());

    act(() => {
      result.current.show({ tone: 'success', title: 'Listo' });
      result.current.show({ tone: 'success', title: 'Listo' });
    });

    expect(result.current.toasts).toHaveLength(2);
    expect(result.current.toasts[0].id).not.toBe(result.current.toasts[1].id);
  });

  it('leaves on its own so the work is never blocked by a notice', () => {
    const { result } = renderHook(() => useToasts(1000));

    act(() => {
      result.current.show({ tone: 'info', title: 'Se rechazó' });
    });
    expect(result.current.toasts).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.toasts).toHaveLength(0);
  });

  it('can be dismissed early without leaving its timer behind', () => {
    const { result } = renderHook(() => useToasts(1000));

    act(() => {
      result.current.show({ tone: 'info', title: 'Se rechazó' });
    });
    act(() => {
      result.current.dismiss(result.current.toasts[0].id);
    });

    expect(result.current.toasts).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('drops every pending timer when the screen goes away', () => {
    const { result, unmount } = renderHook(() => useToasts(1000));

    act(() => {
      result.current.show({ tone: 'info', title: 'Uno' });
      result.current.show({ tone: 'info', title: 'Dos' });
    });
    expect(vi.getTimerCount()).toBe(2);

    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
