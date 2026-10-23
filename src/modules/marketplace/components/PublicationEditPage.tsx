'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Alert } from '@/shared/components/Alert';
import type { OwnPublication } from '../api/publications';
import { readOwnPublication } from '../api/publications';
import { PublicationFormPage } from './PublicationFormPage';

type EditState =
  { status: 'loading' } | { status: 'failed' } | { status: 'ready'; publication: OwnPublication };

// The form opens on what is stored, so an edit is a change and not a rewrite.
export function PublicationEditPage({ publicationId }: { publicationId: string }) {
  const translate = useTranslations('member.publications.form');
  const [state, setState] = useState<EditState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    readOwnPublication(publicationId)
      .then((publication) => {
        if (!cancelled) {
          setState({ status: 'ready', publication });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState({ status: 'failed' });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [publicationId]);

  if (state.status === 'loading') {
    return (
      <div aria-hidden className="px-4 py-6 lg:px-8 lg:py-8">
        <div className="h-96 animate-pulse rounded-lg bg-surface-hover" />
      </div>
    );
  }

  if (state.status === 'failed') {
    return (
      <div className="px-4 py-6 lg:px-8 lg:py-8">
        <Alert tone="danger" title={translate('notFound')} />
      </div>
    );
  }

  return <PublicationFormPage publication={state.publication} />;
}
