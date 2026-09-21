'use client';

import { useRef, useState, type ChangeEvent } from 'react';

const DEFAULT_ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const DEFAULT_MAX_SIZE_BYTES = 10 * 1024 * 1024;

export type ImageUploaderProps = {
  label: string;
  value: string | null;
  onUpload: (contentType: string, base64: string) => Promise<string>;
  onRemove?: () => Promise<void>;
  acceptedTypes?: string[];
  maxSizeBytes?: number;
  hint?: string;
};

// Only the part after the comma is bytes; the "data:image/png;base64," prefix
// the browser attaches is not part of what the API expects to decode.
export function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(reader.error ?? new Error('The file could not be read.'));
    reader.onload = () => {
      const result = reader.result;
      const commaIndex = typeof result === 'string' ? result.indexOf(',') : -1;

      resolve(typeof result === 'string' && commaIndex !== -1 ? result.slice(commaIndex + 1) : '');
    };

    reader.readAsDataURL(file);
  });
}

// Reusable wherever a member attaches a picture to something they own: a
// business logo here, a product photo in the marketplace later.
export function ImageUploader({
  label,
  value,
  onUpload,
  onRemove,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  maxSizeBytes = DEFAULT_MAX_SIZE_BYTES,
  hint,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The preview is the value the caller hands in, never a copy kept here: the
  // caller updates it once the upload or removal actually succeeds.
  const preview = value;

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    if (!acceptedTypes.includes(file.type)) {
      setError('Formato no admitido. Use una imagen JPG, PNG o WEBP.');
      return;
    }

    if (file.size > maxSizeBytes) {
      setError(
        `La imagen supera el tamaño máximo de ${Math.round(maxSizeBytes / (1024 * 1024))} MB.`,
      );
      return;
    }

    setError(null);
    setBusy(true);

    try {
      const base64 = await readAsBase64(file);
      await onUpload(file.type, base64);
    } catch {
      setError('No se pudo subir la imagen. Intente de nuevo.');
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove() {
    if (!onRemove) {
      return;
    }

    setError(null);
    setBusy(true);

    try {
      await onRemove();
    } catch {
      setError('No se pudo quitar la imagen. Intente de nuevo.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>
      {hint && <p className="text-sm text-content-muted">{hint}</p>}

      <div className="flex items-center gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-panel border border-border bg-surface-raised">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-center text-xs text-content-muted">Sin imagen</span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="rounded-control border border-border px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {busy ? 'Subiendo…' : preview ? 'Cambiar imagen' : 'Subir imagen'}
            </button>

            {preview && onRemove && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={busy}
                className="rounded-control border border-border px-4 py-2 text-sm font-medium text-danger disabled:opacity-50"
              >
                Quitar
              </button>
            )}
          </div>

          {error && (
            <p role="alert" className="text-xs text-danger">
              {error}
            </p>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFile}
        className="sr-only"
      />
    </div>
  );
}
