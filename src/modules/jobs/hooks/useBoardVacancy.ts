'use client';

import { useEffect, useState } from 'react';
import { ApiError } from '@/shared/api/apiError';
import { readBoardVacancy, type BoardVacancyDetail } from '../api/vacancies';

export type BoardVacancyState =
  | { status: 'loading' }
  | { status: 'loaded'; vacancy: BoardVacancyDetail }
  | { status: 'missing' }
  | { status: 'failed' };

const NOT_FOUND = 404;

type Answer = { vacancyId: string; state: BoardVacancyState };

// A vacancy that left the board, for whatever reason, answers 404 and reads as
// no longer available.
export function useBoardVacancy(vacancyId: string): BoardVacancyState {
  const [answer, setAnswer] = useState<Answer | null>(null);

  useEffect(() => {
    let cancelled = false;

    readBoardVacancy(vacancyId)
      .then((vacancy) => {
        if (!cancelled) {
          setAnswer({ vacancyId, state: { status: 'loaded', vacancy } });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          const missing = error instanceof ApiError && error.status === NOT_FOUND;
          setAnswer({ vacancyId, state: { status: missing ? 'missing' : 'failed' } });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [vacancyId]);

  return answer !== null && answer.vacancyId === vacancyId ? answer.state : { status: 'loading' };
}
