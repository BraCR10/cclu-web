import { describe, expect, it } from 'vitest';
import { missingSubscriptionFields } from '@/modules/marketplace/hooks/useSubscriptionForm';

const COMPLETE = {
  name: 'Mariana Solís',
  email: 'mariana@cafelomaverde.cr',
  whatsappNumber: '',
  canton: '6aaf2cf895dc1da3c7333013',
  district: 'San Juan',
  acceptsPromotions: true,
};

describe('missingSubscriptionFields', () => {
  it('lets a subscription without WhatsApp through, since it is optional', () => {
    expect(missingSubscriptionFields(COMPLETE)).toEqual([]);
  });

  it('asks for the consent as well as every required field left blank', () => {
    expect(
      missingSubscriptionFields({ ...COMPLETE, district: ' ', acceptsPromotions: false }),
    ).toEqual(['district', 'acceptsPromotions']);
  });
});
