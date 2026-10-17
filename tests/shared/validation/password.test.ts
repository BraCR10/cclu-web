import { describe, it, expect } from 'vitest';
import {
  isPasswordAcceptable,
  isRuleMet,
  passwordByteLength,
  unmetPasswordRules,
} from '@/shared/validation/password';

describe('the password rules', () => {
  it('asks for the same four things the API asks for', () => {
    expect(unmetPasswordRules('')).toEqual(['length', 'letter', 'number', 'symbol']);
    expect(unmetPasswordRules('Contras1!!')).toEqual([]);
  });

  it('measures the length in characters and the hash limit in bytes', () => {
    expect(isRuleMet('length', 'Contra1!!x')).toBe(true);
    expect(isRuleMet('length', 'Contra1!!')).toBe(false);

    // Nine characters and four bytes of accents: short by one character, and
    // counted the way bcrypt counts.
    expect(passwordByteLength('contraseñá1!')).toBeGreaterThan('contraseñá1!'.length);
  });

  it('refuses a password that only some of the rules accept', () => {
    expect(isPasswordAcceptable('contrasena1!')).toBe(true);
    expect(isPasswordAcceptable('Contrasenaa!')).toBe(false);
    expect(isPasswordAcceptable('Contrasena1')).toBe(false);
    expect(isPasswordAcceptable('Contras1!!')).toBe(true);
  });

  it('refuses a password longer than the hash can read', () => {
    expect(isPasswordAcceptable(`A1!${'a'.repeat(70)}`)).toBe(false);
  });
});
