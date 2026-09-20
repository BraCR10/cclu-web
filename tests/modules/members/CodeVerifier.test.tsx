import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CodeVerifier } from '@/modules/members/components/CodeVerifier';
import { ApiError } from '@/shared/api/request';
import type { VerificationResult } from '@/modules/members/api/verification';

const AFFILIATE: VerificationResult = {
  valid: true,
  member: {
    memberCode: 'M-A7K2-Q4',
    businessName: 'Panadería Tres Ríos',
    memberType: 'business',
    sector: 'Alimentos y bebidas',
    canton: 'La Unión',
  },
};

function renderVerifier(verify: (code: string) => Promise<VerificationResult>) {
  render(<CodeVerifier verify={verify} />);

  return userEvent.setup();
}

async function check(user: ReturnType<typeof userEvent.setup>, code: string) {
  await user.type(screen.getByLabelText('Código de agremiado'), code);
  await user.click(screen.getByRole('button', { name: 'Verificar' }));
}

describe('CodeVerifier', () => {
  it('names the affiliate when the code stands', async () => {
    const verify = vi.fn(async () => AFFILIATE);
    const user = renderVerifier(verify);

    await check(user, 'MA7K2Q4');

    expect(await screen.findByText('Afiliado de la Cámara')).toBeTruthy();
    expect(screen.getByText('Panadería Tres Ríos')).toBeTruthy();
    expect(screen.getByText('M-A7K2-Q4')).toBeTruthy();
  });

  it('sends the code without the spaces someone typed around it', async () => {
    const verify = vi.fn(async () => AFFILIATE);
    const user = renderVerifier(verify);

    await check(user, '  MA7K2Q4  ');

    expect(verify).toHaveBeenCalledWith('MA7K2Q4');
  });

  // The screen says no more than the API does, which is the same answer for a
  // code that never existed and one whose affiliation lapsed.
  it('says only that the code does not stand, never why', async () => {
    const verify = vi.fn(async (): Promise<VerificationResult> => ({ valid: false }));
    const user = renderVerifier(verify);

    await check(user, 'MA7K2Q4');

    expect(await screen.findByText(/no corresponde a un afiliado/)).toBeTruthy();
    expect(screen.queryByText(/suspendid/i)).toBeNull();
    expect(screen.queryByText(/rechazad/i)).toBeNull();
  });

  it('explains a rate limit instead of blaming the code', async () => {
    const verify = vi.fn(async (): Promise<VerificationResult> => {
      throw new ApiError(429, 'Too Many Requests');
    });
    const user = renderVerifier(verify);

    await check(user, 'MA7K2Q4');

    expect((await screen.findByRole('alert')).textContent).toContain('Demasiadas consultas');
  });

  it('separates a server that broke from a code that does not stand', async () => {
    const verify = vi.fn(async (): Promise<VerificationResult> => {
      throw new ApiError(500, 'Server Error');
    });
    const user = renderVerifier(verify);

    await check(user, 'MA7K2Q4');

    expect((await screen.findByRole('alert')).textContent).toContain('No fue posible verificar');
    expect(screen.queryByText(/no corresponde a un afiliado/)).toBeNull();
  });

  it('will not ask about an empty code', async () => {
    const verify = vi.fn(async () => AFFILIATE);
    renderVerifier(verify);

    const button = screen.getByRole('button', { name: 'Verificar' }) as HTMLButtonElement;

    expect(button.disabled).toBe(true);
    expect(verify).not.toHaveBeenCalled();
  });
});
