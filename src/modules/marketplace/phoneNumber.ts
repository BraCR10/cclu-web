const COUNTRY_CODE = '506';
const LOCAL_LENGTH = 8;

function digitsOf(phone: string) {
  return phone.replace(/\D/g, '');
}

// The number with its country code, as a dialler or WhatsApp needs it. A member
// may have written it with or without +506, with dashes or spaces.
function internationalDigits(phone: string) {
  const digits = digitsOf(phone);

  return digits.length === LOCAL_LENGTH ? `${COUNTRY_CODE}${digits}` : digits;
}

// A Costa Rican number reads in two blocks of four, the way people say it.
export function formatPhoneNumber(phone: string): string {
  const digits = digitsOf(phone);
  const local =
    digits.length === LOCAL_LENGTH + COUNTRY_CODE.length && digits.startsWith(COUNTRY_CODE)
      ? digits.slice(COUNTRY_CODE.length)
      : digits;

  return local.length === LOCAL_LENGTH ? `${local.slice(0, 4)} ${local.slice(4)}` : phone;
}

export function callHref(phone: string): string {
  return `tel:+${internationalDigits(phone)}`;
}

export function whatsappHref(phone: string): string {
  return `https://wa.me/${internationalDigits(phone)}`;
}
