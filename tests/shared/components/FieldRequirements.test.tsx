import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Field, CONTROL_CLASS } from '@/shared/components/Field';
import { describeField } from '@/shared/config/messages';

function renderField(error?: string) {
  render(
    <Field id="website" label="Sitio web" error={error}>
      {(control) => <input id="website" {...control} className={CONTROL_CLASS} />}
    </Field>,
  );

  return userEvent.setup();
}

function trigger() {
  return screen.getByRole('button', { name: 'Ver los requisitos de este dato' });
}

describe('field requirements', () => {
  // A telephone has no pointer to hover with, and the registration form is the
  // one people fill on a telephone.
  it('opens on a click, not only on hover', async () => {
    const user = renderField();

    expect(screen.queryByRole('note')).toBeNull();

    await user.click(trigger());

    expect(screen.getByRole('note')).toBeTruthy();
  });

  it('lists every rule the field applies', async () => {
    const user = renderField();
    await user.click(trigger());

    const note = screen.getByRole('note');

    for (const rule of describeField('website')) {
      expect(note.textContent).toContain(rule);
    }
  });

  it('closes on Escape', async () => {
    const user = renderField();
    await user.click(trigger());
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('note')).toBeNull();
  });

  // The popup is a convenience. Somebody who cannot open it still has to be
  // able to learn what the field wants.
  it('carries the rules where a screen reader reaches them without opening it', () => {
    renderField();

    const described = screen.getByLabelText('Sitio web').getAttribute('aria-describedby') ?? '';

    expect(described.split(' ')).toContain('website-requirements');
    expect(document.getElementById('website-requirements')?.textContent).toContain('https://');
  });

  it('offers the rules from the refusal itself once the field is wrong', async () => {
    const user = renderField('Debe empezar con https:// o http://');

    await user.click(trigger());

    expect(screen.getByRole('note')).toBeTruthy();
  });
});
