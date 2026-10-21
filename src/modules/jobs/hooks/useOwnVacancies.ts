'use client';

import { useTranslations } from 'next-intl';
import { useToast } from '@/shared/components/useToast';
import { useErrorFeedback } from '@/shared/errors/useErrorFeedback';
import { usePagedList, type PagedQuery } from '@/shared/hooks/usePagedList';
import { deleteVacancy, readOwnVacancies, type OwnVacancyList } from '../api/vacancies';

function readOwnVacancyPage({ page }: PagedQuery<object>) {
  return readOwnVacancies(page);
}

export function useOwnVacancies() {
  const translate = useTranslations('member.vacancies');
  const { showToast } = useToast();
  const showError = useErrorFeedback();
  const vacancies = usePagedList<object, OwnVacancyList>(readOwnVacancyPage, {});

  return {
    ...vacancies,
    remove: async (vacancyId: string) => {
      try {
        await deleteVacancy(vacancyId);
        showToast({ tone: 'success', title: translate('deleted') });
        vacancies.reload();
      } catch (error) {
        showError(error);
      }
    },
  };
}
