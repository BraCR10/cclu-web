import { TriangleAlert } from 'lucide-react';

type FieldMessageProps = {
  id: string;
  error?: string;
  help?: string;
};

export function FieldMessage({ id, error, help }: FieldMessageProps) {
  if (error) {
    return (
      <p id={id} className="flex items-start gap-1 text-body-s text-danger">
        <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
        {error}
      </p>
    );
  }

  if (help) {
    return (
      <p id={id} className="text-body-s text-fg-muted">
        {help}
      </p>
    );
  }

  return null;
}
