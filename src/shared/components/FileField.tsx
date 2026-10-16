import { useId, useRef, useState } from 'react';
import { FileText, Trash2, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from './Button';
import { FieldMessage } from './FieldMessage';
import { classNames } from '@/shared/utils/classNames';

export type AttachedFile = {
  name: string;
  sizeInBytes: number;
};

type FileFieldProps = {
  label: string;
  hint: string;
  acceptedFormats: string;
  accept: string;
  status: 'empty' | 'uploading' | 'stored';
  file?: AttachedFile;
  error?: string;
  onSelect: (file: File) => void;
  onRemove: () => void;
  onView?: () => void;
};

function inKilobytes(sizeInBytes: number): string {
  return `${Math.round(sizeInBytes / 1024)} KB`;
}

// Presentational on purpose: the wizard holds the state and does the uploading,
// so this only draws the three things a person can see — the zone to drop into,
// the wait, and the file that arrived.
export function FileField({
  label,
  hint,
  acceptedFormats,
  accept,
  status,
  file,
  error,
  onSelect,
  onRemove,
  onView,
}: FileFieldProps) {
  const translate = useTranslations('common.file');
  const inputId = useId();
  const messageId = `${inputId}-message`;
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const describedBy = error === undefined ? undefined : messageId;

  return (
    <div>
      <span className="text-label-m text-fg" id={`${inputId}-label`}>
        {label}
      </span>

      {status === 'stored' && file !== undefined ? (
        <div className="mt-2 flex items-center gap-4 rounded-md border border-line bg-surface-subtle p-3">
          <span
            aria-hidden="true"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xs bg-surface text-fg-secondary"
          >
            <FileText className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-body-m text-fg">{file.name}</span>
            <span className="block text-body-s text-fg-muted">
              {translate('stored', { size: inKilobytes(file.sizeInBytes) })}
            </span>
          </span>
          {onView !== undefined && (
            <Button type="button" variant="ghost" size="s" onClick={onView}>
              {translate('view')}
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="s"
            onClick={onRemove}
            aria-label={translate('removeNamed', { name: file.name })}
          >
            <Trash2 aria-hidden="true" className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);

            const dropped = event.dataTransfer.files[0];

            if (dropped !== undefined) {
              onSelect(dropped);
            }
          }}
          className={classNames(
            'mt-2 flex min-h-11 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed p-6 text-center',
            dragging ? 'border-primary bg-surface-subtle' : 'border-line bg-surface',
            error !== undefined && 'border-danger',
          )}
        >
          <span
            aria-hidden="true"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-hover text-fg-secondary"
          >
            <Upload className="h-5 w-5" />
          </span>
          <span className="text-body-m text-fg-secondary">
            {status === 'uploading' ? translate('uploading') : hint}
          </span>
          <span className="text-body-s text-fg-muted">{acceptedFormats}</span>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={accept}
            disabled={status === 'uploading'}
            aria-labelledby={`${inputId}-label`}
            aria-describedby={describedBy}
            aria-invalid={error !== undefined}
            className="sr-only"
            onChange={(event) => {
              const chosen = event.target.files?.[0];

              if (chosen !== undefined) {
                onSelect(chosen);
              }

              // Cleared so choosing the same file twice counts twice: somebody
              // removing a certification and picking it again is ordinary.
              if (inputRef.current !== null) {
                inputRef.current.value = '';
              }
            }}
          />
        </label>
      )}

      {error !== undefined && (
        <div className="mt-2">
          <FieldMessage id={messageId} error={error} />
        </div>
      )}
    </div>
  );
}
