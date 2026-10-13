import { describe, it, expect } from 'vitest';
import { messages } from '@/i18n/messages';
import apiErrorCodes from '../../fixtures/apiErrorCodes.json';

describe('the errors catalog', () => {
  it('has a sentence for every code the API registry lists', () => {
    const catalog = messages.errors as Record<string, string>;
    const untranslated = Object.values(apiErrorCodes).filter((code) => !(code in catalog));

    expect(untranslated).toEqual([]);
  });

  it('has the generic sentence shown for anything it cannot name', () => {
    expect(messages.errors.generic).toBe('Algo salió mal. Intentá de nuevo.');
  });

  it('never leaves a sentence empty', () => {
    const empty = Object.entries(messages.errors).filter(([, sentence]) => sentence.trim() === '');

    expect(empty).toEqual([]);
  });
});
