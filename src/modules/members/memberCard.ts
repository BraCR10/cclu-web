import QRCode from 'qrcode';
import { formatMemberCode } from '@/shared/format';

// The permanent contract. A card already issued carries this path inside its
// code, and a member code is never reissued, so changing this later would kill
// cards that are already out there.
export const DIRECTORY_PATH = 'directory';

export function directoryPathFor(memberCode: string): string {
  return `/${DIRECTORY_PATH}/${memberCode.replace(/-/g, '')}`;
}

// Absolute, because the code is read by a camera on somebody else's telephone
// and a relative path means nothing there.
export function directoryUrlFor(memberCode: string, origin: string): string {
  return `${origin.replace(/\/+$/, '')}${directoryPathFor(memberCode)}`;
}

// Medium correction recovers about fifteen per cent of a damaged symbol, which
// is what a card photographed off a screen needs without growing the pattern.
export function renderQrCode(url: string): Promise<string> {
  return QRCode.toString(url, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 1,
    color: { dark: '#000000', light: '#ffffff' },
  });
}

export function displayCode(memberCode: string): string {
  return formatMemberCode(memberCode);
}
