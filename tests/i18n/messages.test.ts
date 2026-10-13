import { describe, it, expect } from 'vitest';
import { messages } from '@/i18n/messages';

describe('the message namespaces', () => {
  it('are common, errors and one per area', () => {
    expect(Object.keys(messages).sort()).toEqual(['admin', 'common', 'errors', 'member', 'public']);
  });
});
