import { describe, it, expect } from 'vitest';
import { ApiError } from '@/shared/api/apiError';
import { useErrorPresenter } from '@/shared/errors/useErrorPresenter';
import { renderHookWithIntl } from '../../support/renderWithIntl';

function present(error: unknown) {
  const { result } = renderHookWithIntl(() => useErrorPresenter());

  return result.current(error);
}

describe('useErrorPresenter', () => {
  it('gives the Spanish sentence for a code, beside the field it names', () => {
    const error = new ApiError({ status: 400, code: 'too_long', field: 'phone', message: 'x' });

    expect(present(error)).toEqual({
      placement: 'field',
      field: 'phone',
      message: 'El texto es demasiado largo.',
    });
  });

  it('gives the generic sentence for a code the catalog lacks', () => {
    const error = new ApiError({ status: 400, code: 'not_in_catalog', message: 'x' });

    expect(present(error)).toEqual({
      placement: 'toast',
      message: 'Algo salió mal. Intentá de nuevo.',
    });
  });

  it('gives the generic sentence for a server error', () => {
    const error = new ApiError({ status: 500, code: 'internal_error', message: 'x' });

    expect(present(error).message).toBe('Algo salió mal. Intentá de nuevo.');
  });
});
