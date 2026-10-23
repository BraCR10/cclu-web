'use client';

import { useTranslations } from 'next-intl';
import { useToast } from '@/shared/components/useToast';
import { useErrorFeedback } from '@/shared/errors/useErrorFeedback';
import { usePagedList, type PagedQuery } from '@/shared/hooks/usePagedList';
import type { PublicationType } from '../api/marketplace';
import {
  deletePublication,
  readOwnPublications,
  setPublicationStatus,
  type OwnPublication,
  type OwnPublicationList,
} from '../api/publications';

type Filters = { type: PublicationType | '' };

function readPage({ type, page }: PagedQuery<Filters>) {
  return readOwnPublications(type, page);
}

export function useOwnPublications() {
  const translate = useTranslations('member.publications');
  const { showToast } = useToast();
  const showError = useErrorFeedback();
  const publications = usePagedList<Filters, OwnPublicationList>(readPage, { type: '' });

  return {
    ...publications,
    remove: async (publication: OwnPublication) => {
      try {
        await deletePublication(publication.id);
        showToast({ tone: 'success', title: translate('deleted') });
        publications.reload();
      } catch (error) {
        showError(error);
      }
    },
    // Taking one down and putting it back is the member's, and the API is what
    // decides whether this one is theirs to move.
    toggle: async (publication: OwnPublication) => {
      const next = publication.status === 'active' ? 'inactive' : 'active';

      try {
        await setPublicationStatus(publication.id, next);
        showToast({
          tone: 'success',
          title: translate(next === 'active' ? 'reactivated' : 'deactivated'),
        });
        publications.reload();
      } catch (error) {
        showError(error);
      }
    },
  };
}
