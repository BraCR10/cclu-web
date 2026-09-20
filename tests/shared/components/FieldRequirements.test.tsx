import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Field, CONTROL_CLASS } from '@/shared/components/Field';
import { describeField, messageForFieldCode } from '@/shared/config/messages';

const REFUSAL = messageForFieldCode('website', 'required');

function renderField(error?: string) {
  render(
    <Field id="website" label="Sitio web" error={error}>
      {(control) => <input id="website" {...control} className={CONTROL_CLASS} />}
    </Field>,
  );

  return userEvent.setup();
}

function trigger() {
  return screen.getByRole('button', { name: 'Ver qué pasa con este dato' });
}

describe('field refusals', () => {
  it('offers nothing while the field is still fine', () => {
    renderField();

    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByLabelText('Sitio web').getAttribute('aria-describedby')).toBeNull();
  });

  // A line appearing below the control pushes every field after it down the
  // screen, which is the moment somebody loses the place they were typing in.
  it('says nothing below the control, so a refusal moves no other field', () => {
    const { container } = render(
      <Field id="website" label="Sitio web" error={REFUSAL}>
        {(control) => <input id="website" {...control} className={CONTROL_CLASS} />}
      </Field>,
    );

    const visible = Array.from(container.querySelectorAll('p, div, span')).filter(
      (node) => !node.className.includes('sr-only') && node.textContent === REFUSAL,
    );

    expect(visible).toHaveLength(0);
  });

  it('marks the control itself as wrong', () => {
    renderField(REFUSAL);

    expect(screen.getByLabelText('Sitio web').getAttribute('aria-invalid')).toBe('true');
  });

  // A telephone has no pointer to hover with, and the registration form is the
  // one people fill on a telephone.
  it('opens on a click, not only on hover', async () => {
    const user = renderField(REFUSAL);

    expect(screen.queryByRole('note')).toBeNull();

    await user.click(trigger());

    expect(screen.getByRole('note')).toBeTruthy();
  });

  it('gives the reason first and then what the field asks for', async () => {
    const user = renderField(REFUSAL);
    await user.click(trigger());

    const note = screen.getByRole('note');

    expect(note.textContent).toContain(REFUSAL);

    for (const rule of describeField('website')) {
      expect(note.textContent).toContain(rule);
    }
  });

  it('closes on Escape', async () => {
    const user = renderField(REFUSAL);
    await user.click(trigger());
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('note')).toBeNull();
  });

  // The note is a convenience. Somebody who cannot open it still has to be told
  // what was refused.
  it('carries the refusal where a screen reader reaches it without opening it', () => {
    renderField(REFUSAL);

    const described = screen.getByLabelText('Sitio web').getAttribute('aria-describedby') ?? '';

    expect(described.split(' ')).toContain('website-error');
    expect(document.getElementById('website-error')?.textContent).toContain(REFUSAL);
    expect(document.getElementById('website-error')?.textContent).toContain('https://');
  });

  it('still refuses a field the rules say nothing about', async () => {
    render(
      <Field id="memberType" label="Tipo" error="Seleccione una opción.">
        {(control) => <input id="memberType" {...control} />}
      </Field>,
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Ver qué pasa con este dato' }));

    expect(screen.getByRole('note').textContent).toContain('Seleccione una opción.');
  });
});
