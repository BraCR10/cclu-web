import { describe, it, expect } from 'vitest';
import { formatMemberCode } from '@/shared/format/memberCode';

describe('formatMemberCode', () => {
  it('groups a code so it can be read aloud', () => {
    expect(formatMemberCode('MA7K2Q4')).toBe('M-A7K2-Q4');
  });

  it('leaves anything that is not a code untouched', () => {
    expect(formatMemberCode('')).toBe('');
    expect(formatMemberCode('M-A7K2-Q4')).toBe('M-A7K2-Q4');
    expect(formatMemberCode('short')).toBe('short');
  });
});
