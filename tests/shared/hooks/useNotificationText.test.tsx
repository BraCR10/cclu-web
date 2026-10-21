import { describe, expect, it } from 'vitest';
import type { AppNotification, NotificationAudience } from '@/shared/api/notifications';
import { useNotificationText } from '@/shared/hooks/useNotificationText';
import { renderHookWithIntl } from '../../support/renderWithIntl';

function describeFor(audience: NotificationAudience, notification: Partial<AppNotification>) {
  const describe = renderHookWithIntl(() => useNotificationText(audience)).result.current;

  return describe({
    id: 'n1',
    type: 'payment_submitted',
    params: {},
    read: false,
    createdAt: '2026-10-20T12:00:00Z',
    ...notification,
  } as AppNotification);
}

describe('useNotificationText', () => {
  it('tells the panel who paid and how much, and leads to the payments', () => {
    const { text, href } = describeFor('admin', {
      type: 'payment_submitted',
      params: { businessName: 'Veterinaria Patitas', amount: 5000 },
    });

    expect(text).toBe('Veterinaria Patitas registró un pago de ₡5.000');
    expect(href).toBe('/admin/payments');
  });

  it('tells the member the day their plan now runs to, on the chamber calendar', () => {
    const { text, href } = describeFor('member', {
      type: 'payment_approved',
      params: { amount: 10000, validUntil: '2026-11-17' },
    });

    expect(text).toContain('17 nov 2026');
    expect(href).toBe('/member/payments');
  });

  it('says the same expiry differently to the member and to the panel', () => {
    const params = {
      businessName: 'Hostal Cerro Dulce',
      planName: 'Pro Pymex',
      validUntil: '2026-10-23',
    };

    expect(describeFor('admin', { type: 'membership_expiring', params }).text).toContain(
      'Hostal Cerro Dulce',
    );
    expect(describeFor('member', { type: 'membership_expiring', params }).text).toMatch(/^Tu plan/);
  });

  it('shows nothing for a notice the web does not know how to say', () => {
    expect(describeFor('member', { type: 'payment_submitted' }).text).toBeNull();
  });
});
