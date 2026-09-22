'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import { readAsBase64 } from './ImageUploader';

const DEFAULT_ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const DEFAULT_MAX_SIZE_BYTES = 10 * 1024 * 1024;

export type Attachment = {
  contentType: string;
  content: string;
  fileName: string;
};

type AttachmentPickerProps = {
  label: string;
  value: Attachment | null;
  onChange: (attachment: Attachment | null) => void;
  acceptedTypes?: string[];
  maxSizeBytes?: number;
  hint?: string;
  error?: string;
};

// Unlike ImageUploader, nothing leaves the browser here: the file is read,
// held, and sent later as part of the form it belongs to. That is what a
// payment needs, where the receipt travels with the date and the detail.
export function AttachmentPicker({
  label,
  value,
  onChange,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  maxSizeBytes = DEFAULT_MAX_SIZE_BYTES,
  hint,
  error,
}: AttachmentPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [readError, setReadError] = useState<string | null>(null);

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    if (!acceptedTypes.includes(file.type)) {
      setReadError('Formato no admitido. Use una imagen JPG, PNG, WEBP o un PDF.');
      return;
    }

    if (file.size > maxSizeBytes) {
      setReadError(
        `El archivo supera el tamaño máximo de ${Math.round(maxSizeBytes / (1024 * 1024))} MB.`,
      );
      return;
    }

    setReadError(null);

    try {
      const content = await readAsBase64(file);
      onChange({ contentType: file.type, content, fileName: file.name });
    } catch {
      setReadError('No se pudo leer el archivo. Intente de nuevo.');
    }
  }

  const shown = readError ?? error ?? null;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>
      {hint && <p className="text-sm text-content-muted">{hint}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-control border border-border px-4 py-2 text-sm font-medium"
        >
          {value ? 'Cambiar archivo' : 'Adjuntar archivo'}
        </button>

        {value && (
          <span className="flex items-center gap-2 rounded-pill bg-surface px-3 py-1.5 text-sm">
            <span className="max-w-48 truncate">{value.fileName}</span>
            <button
              type="button"
              aria-label="Quitar el archivo adjunto"
              onClick={() => onChange(null)}
              className="text-content-muted"
            >
              ×
            </button>
          </span>
        )}
      </div>

      {shown && (
        <p role="alert" className="text-xs text-danger">
          {shown}
        </p>
      )}

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
