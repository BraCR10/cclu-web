import { describe, it, expect } from 'vitest';
import { useState } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError } from '@/shared/api/apiError';
import { ToastProvider } from '@/shared/components/ToastProvider';
import { useErrorFeedback } from '@/shared/errors/useErrorFeedback';
import { renderWithIntl } from '../../support/renderWithIntl';

function Form({ error }: { error: unknown }) {
  const showError = useErrorFeedback();
  const [fieldError, setFieldError] = useState<string | null>(null);

  return (
    <>
      <button type="button" onClick={() => setFieldError(showError(error)?.message ?? null)}>
        Enviar
      </button>
      {fieldError && <p data-testid="field-error">{fieldError}</p>}
    </>
  );
}

function renderForm(error: unknown) {
  renderWithIntl(
    <ToastProvider>
      <Form error={error} />
    </ToastProvider>,
  );
}

describe('useErrorFeedback', () => {
  it('hands a field error back to the form and shows no toast', async () => {
    renderForm(new ApiError({ status: 400, code: 'too_long', field: 'phone', message: 'x' }));

    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(screen.getByTestId('field-error')).toHaveTextContent('El texto es demasiado largo.');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows an error without a field in a toast', async () => {
    renderForm(new ApiError({ status: 401, code: 'invalid_credentials', message: 'x' }));

    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'El correo o la contraseña no son correctos.',
    );
    expect(screen.queryByTestId('field-error')).not.toBeInTheDocument();
  });
});
