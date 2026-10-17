// Stated once and read by every screen that tells a member how to pay, so the
// account a member is told to pay into can only ever be the same one.
export const PAYMENT_METHODS = {
  sinpe: {
    number: '6128 2812',
    holder: 'Cámara de Comercio de La Unión',
  },
  transfer: {
    bank: 'Banco Nacional de Costa Rica (BN)',
    account: '200-01-070-007351-3',
    iban: 'CR72 0151 0702 0010 0735 11',
  },
} as const;

export const CHAMBER_WHATSAPP_HREF = 'https://wa.me/50661282812';
