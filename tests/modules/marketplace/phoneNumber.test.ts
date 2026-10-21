import { describe, expect, it } from 'vitest';
import { callHref, formatPhoneNumber, whatsappHref } from '@/modules/marketplace/phoneNumber';

describe('formatPhoneNumber', () => {
  it('reads a Costa Rican number in two blocks of four, however it was written', () => {
    expect(formatPhoneNumber('88451290')).toBe('8845 1290');
    expect(formatPhoneNumber('+506 8845-1290')).toBe('8845 1290');
  });

  it('leaves a number of any other length as it was written', () => {
    expect(formatPhoneNumber('911')).toBe('911');
  });
});

describe('callHref and whatsappHref', () => {
  it('add the country code once, whether or not the member wrote it', () => {
    expect(callHref('8845-1290')).toBe('tel:+50688451290');
    expect(callHref('+506 8845 1290')).toBe('tel:+50688451290');
    expect(whatsappHref('(506) 8845-1290')).toBe('https://wa.me/50688451290');
  });
});
