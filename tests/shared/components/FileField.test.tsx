import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileField } from '@/shared/components/FileField';
import { renderWithIntl } from '../../support/renderWithIntl';

const LABEL = 'Certificación de personería jurídica';

const base = {
  label: LABEL,
  hint: 'Arrastrá el archivo o elegilo desde tu equipo',
  acceptedFormats: 'PDF, JPG o PNG, máximo 10 MB',
  accept: 'application/pdf,image/jpeg,image/png',
};

describe('FileField', () => {
  it('hands the chosen file to whoever knows where it goes', async () => {
    const onSelect = vi.fn();

    renderWithIntl(<FileField {...base} status="empty" onSelect={onSelect} onRemove={() => {}} />);

    const file = new File(['x'], 'personeria.pdf', { type: 'application/pdf' });

    await userEvent.upload(screen.getByLabelText(LABEL), file);

    expect(onSelect).toHaveBeenCalledWith(file);
  });

  it('shows the file that arrived and offers to take it back off', async () => {
    const onRemove = vi.fn();

    renderWithIntl(
      <FileField
        {...base}
        status="stored"
        file={{ name: 'personeria.pdf', sizeInBytes: 491520 }}
        onSelect={() => {}}
        onRemove={onRemove}
      />,
    );

    expect(screen.getByText('personeria.pdf')).toBeInTheDocument();
    expect(screen.getByText('Subido, 480 KB')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Eliminar personeria.pdf' }));

    expect(onRemove).toHaveBeenCalled();
  });

  // A file is being sent, which is not the same as one that arrived, and saying
  // so is what stops somebody sending the form again.
  it('says the upload is still running rather than pretending it finished', () => {
    renderWithIntl(
      <FileField {...base} status="uploading" onSelect={() => {}} onRemove={() => {}} />,
    );

    expect(screen.getByText('Subiendo…')).toBeInTheDocument();
  });

  it('says what went wrong under the field', () => {
    renderWithIntl(
      <FileField
        {...base}
        status="empty"
        error="El archivo es demasiado grande."
        onSelect={() => {}}
        onRemove={() => {}}
      />,
    );

    expect(screen.getByLabelText(LABEL)).toHaveAccessibleDescription(
      'El archivo es demasiado grande.',
    );
  });
});
