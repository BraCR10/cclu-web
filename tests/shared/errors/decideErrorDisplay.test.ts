import { describe, it, expect } from 'vitest';
import { ApiError } from '@/shared/api/apiError';
import { decideErrorDisplay } from '@/shared/errors/decideErrorDisplay';

const knownCodes = new Set(['too_long', 'invalid_credentials']);
const isKnownCode = (code: string) => knownCodes.has(code);

function apiError(status: number, code: string, field?: string) {
  return new ApiError({ status, code, field, message: 'English detail.' });
}

describe('decideErrorDisplay', () => {
  it('puts an error with a field under that input, with its own sentence', () => {
    expect(decideErrorDisplay(apiError(400, 'too_long', 'phone'), isKnownCode)).toEqual({
      placement: 'field',
      field: 'phone',
      messageKey: 'too_long',
    });
  });

  it('shows an error without a field in a toast', () => {
    expect(decideErrorDisplay(apiError(401, 'invalid_credentials'), isKnownCode)).toEqual({
      placement: 'toast',
      messageKey: 'invalid_credentials',
    });
  });

  it('shows the generic sentence for a code the catalog does not know', () => {
    expect(decideErrorDisplay(apiError(400, 'brand_new_code'), isKnownCode)).toEqual({
      placement: 'toast',
      messageKey: 'generic',
    });
  });

  it('keeps an unknown code with a field beside its input, with the generic sentence', () => {
    expect(decideErrorDisplay(apiError(400, 'brand_new_code', 'phone'), isKnownCode)).toEqual({
      placement: 'field',
      field: 'phone',
      messageKey: 'generic',
    });
  });

  it('shows the generic sentence in a toast for any server error', () => {
    expect(decideErrorDisplay(apiError(503, 'too_long', 'phone'), isKnownCode)).toEqual({
      placement: 'toast',
      messageKey: 'generic',
    });
  });

  it('shows the generic sentence in a toast for something that is not an API error', () => {
    expect(decideErrorDisplay(new TypeError('boom'), isKnownCode)).toEqual({
      placement: 'toast',
      messageKey: 'generic',
    });
    expect(decideErrorDisplay('a string', isKnownCode)).toEqual({
      placement: 'toast',
      messageKey: 'generic',
    });
  });
});

describe('decideErrorDisplay without a connection', () => {
  it('names the lost connection instead of the generic sentence', () => {
    expect(decideErrorDisplay(apiError(0, 'network_error'), () => true)).toEqual({
      placement: 'toast',
      messageKey: 'network_error',
    });
  });
});
