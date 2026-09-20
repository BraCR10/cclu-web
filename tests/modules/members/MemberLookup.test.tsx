import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemberLookup } from '@/modules/members/components/MemberLookup';
import { MESSAGES } from '@/shared/config/messages';

// The component reaches for the router unconditionally, as a hook must. What
// the test replaces is the navigation itself, through the prop.
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

function renderLookup() {
  const navigate = vi.fn();

  render(<MemberLookup navigate={navigate} />);

  return { navigate, user: userEvent.setup() };
}

function look(user: ReturnType<typeof userEvent.setup>) {
  return user.click(screen.getByRole('button', { name: 'Ver ficha' }));
}

describe('MemberLookup', () => {
  // Separators are how the code is printed on a card, not part of it.
  it('takes the code as it is printed, separators and lower case included', async () => {
    const { navigate, user } = renderLookup();

    await user.type(screen.getByLabelText('Código de agremiado'), 'm-a7k2-q4');
    await look(user);

    expect(navigate).toHaveBeenCalledWith('/directory/MA7K2Q4');
  });

  it('says the code is missing rather than refusing to be pressed', async () => {
    const { navigate, user } = renderLookup();

    await look(user);

    expect(await screen.findByText(MESSAGES.required)).toBeTruthy();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('refuses a code of the wrong shape before asking the server for it', async () => {
    const { navigate, user } = renderLookup();

    await user.type(screen.getByLabelText('Código de agremiado'), 'ABC');
    await look(user);

    expect(await screen.findByText(MESSAGES.invalid_format)).toBeTruthy();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('marks the control itself as wrong, not only the text below it', async () => {
    const { user } = renderLookup();

    const input = screen.getByLabelText('Código de agremiado');
    await look(user);

    expect(input.getAttribute('aria-invalid')).toBe('true');
  });
});
