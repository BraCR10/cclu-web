import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImageUploader } from '@/shared/components/ImageUploader';

function pngFile(name: string, bytes: number): File {
  return new File([new Uint8Array(bytes)], name, { type: 'image/png' });
}

describe('ImageUploader', () => {
  it('shows a placeholder when there is nothing to preview', () => {
    render(<ImageUploader label="Logo" value={null} onUpload={vi.fn()} />);

    expect(screen.getByText('Sin imagen')).toBeTruthy();
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('shows the address it is given as the preview', () => {
    const { container } = render(
      <ImageUploader label="Logo" value="https://storage.example/signed" onUpload={vi.fn()} />,
    );

    expect(container.querySelector('img')?.getAttribute('src')).toBe(
      'https://storage.example/signed',
    );
  });

  it('reads a chosen file as base64 and hands it to onUpload with its content type', async () => {
    const user = userEvent.setup();
    const onUpload = vi.fn().mockResolvedValue('https://storage.example/new');

    const { container } = render(<ImageUploader label="Logo" value={null} onUpload={onUpload} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    await user.upload(input, pngFile('logo.png', 4));

    await waitFor(() => expect(onUpload).toHaveBeenCalledTimes(1));
    expect(onUpload.mock.calls[0][0]).toBe('image/png');
    expect(typeof onUpload.mock.calls[0][1]).toBe('string');
  });

  it('refuses a file larger than the maximum without ever calling onUpload', async () => {
    const user = userEvent.setup();
    const onUpload = vi.fn();

    const { container } = render(
      <ImageUploader label="Logo" value={null} onUpload={onUpload} maxSizeBytes={10} />,
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    await user.upload(input, pngFile('big.png', 20));

    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(onUpload).not.toHaveBeenCalled();
  });

  it('refuses a content type outside the accepted list without calling onUpload', async () => {
    const onUpload = vi.fn();
    const file = new File(['x'], 'file.exe', { type: 'application/x-msdownload' });

    const { container } = render(<ImageUploader label="Logo" value={null} onUpload={onUpload} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    // fireEvent bypasses user-event's own accept-attribute filtering, so it is
    // this component's validation under test, not the library's.
    Object.defineProperty(input, 'files', { value: [file] });
    fireEvent.change(input);

    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(onUpload).not.toHaveBeenCalled();
  });

  it('offers no removal button until there is something to remove', () => {
    render(<ImageUploader label="Logo" value={null} onUpload={vi.fn()} onRemove={vi.fn()} />);

    expect(screen.queryByRole('button', { name: 'Quitar' })).toBeNull();
  });

  it('calls onRemove when an existing image is removed', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn().mockResolvedValue(undefined);

    render(
      <ImageUploader
        label="Logo"
        value="https://storage.example/signed"
        onUpload={vi.fn()}
        onRemove={onRemove}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Quitar' }));

    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});
