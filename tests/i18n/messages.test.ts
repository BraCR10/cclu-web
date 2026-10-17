import { describe, it, expect } from 'vitest';
import { messages } from '@/i18n/messages';

describe('the message namespaces', () => {
  it('are the shared ones and one per area or flow', () => {
    expect(Object.keys(messages).sort()).toEqual([
      'admin',
      'auth',
      'common',
      'correction',
      'errors',
      'member',
      'plans',
      'public',
      'registration',
    ]);
  });
});
