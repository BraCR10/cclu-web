import { describe, it, expect } from 'vitest';
import {
  IDENTIFICATION_TYPES,
  IDENTIFICATION_TYPE_LABELS,
  MEMBER_TYPES,
  MEMBER_TYPE_LABELS,
} from '@/shared/config/memberTypes';

describe('member vocabulary', () => {
  // A value the API stores with nothing to show for it renders as undefined on
  // whichever screen meets it first.
  it('has a label for every value, on both sides', () => {
    for (const value of Object.values(MEMBER_TYPES)) {
      expect(MEMBER_TYPE_LABELS[value]).toBeTruthy();
    }

    for (const value of Object.values(IDENTIFICATION_TYPES)) {
      expect(IDENTIFICATION_TYPE_LABELS[value]).toBeTruthy();
    }
  });

  it('labels nothing the API does not store', () => {
    expect(Object.keys(MEMBER_TYPE_LABELS).sort()).toEqual(Object.values(MEMBER_TYPES).sort());
    expect(Object.keys(IDENTIFICATION_TYPE_LABELS).sort()).toEqual(
      Object.values(IDENTIFICATION_TYPES).sort(),
    );
  });

  // The values are the contract with the API and with what is already stored.
  // Renaming one is a migration, not a rename.
  it('keeps the values the API stores', () => {
    expect(Object.values(MEMBER_TYPES)).toEqual(['business', 'independent_professional']);
    expect(Object.values(IDENTIFICATION_TYPES)).toEqual([
      'national_id',
      'legal_entity_id',
      'passport',
      'dimex',
    ]);
  });
});
