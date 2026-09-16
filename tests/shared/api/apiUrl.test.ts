import { describe, it, expect } from 'vitest';
import { buildApiUrl } from '@/shared/api/apiUrl';

describe('buildApiUrl', () => {
  it('joins a base and a path that already agree on the separator', () => {
    expect(buildApiUrl('/agremiados', 'http://localhost:4000')).toBe(
      'http://localhost:4000/agremiados',
    );
  });

  it('does not produce a double slash when the base ends with one', () => {
    expect(buildApiUrl('/agremiados', 'http://localhost:4000/')).toBe(
      'http://localhost:4000/agremiados',
    );
  });

  it('adds the separator when the path does not start with one', () => {
    expect(buildApiUrl('agremiados', 'http://localhost:4000')).toBe(
      'http://localhost:4000/agremiados',
    );
  });

  it('normalises both sides at once', () => {
    expect(buildApiUrl('agremiados', 'http://localhost:4000///')).toBe(
      'http://localhost:4000/agremiados',
    );
  });

  it('returns a root-relative path when no base is configured', () => {
    expect(buildApiUrl('/agremiados', '')).toBe('/agremiados');
  });
});
