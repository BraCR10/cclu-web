'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useToast } from '@/shared/components/useToast';
import { useErrorPresenter } from '@/shared/errors/useErrorPresenter';
import {
  createActivity,
  readActivities,
  removeActivity,
  updateActivity,
  type ActivityCounts,
  type ActivityFilter,
  type ActivityStatus,
  type CatalogActivity,
} from '../api/activities';

export type CatalogState = 'loading' | 'failed' | 'ready';

export type CatalogOutcome = { ok: true } | { ok: false; message: string; field?: string };

export function useActivities() {
  const translate = useTranslations('admin.activities');
  const { showToast } = useToast();
  const present = useErrorPresenter();
  // The presenter is rebuilt each render; the ref keeps the read from running
  // again every time the screen changes.
  const presenter = useRef(present);

  useEffect(() => {
    presenter.current = present;
  });

  const [state, setState] = useState<CatalogState>('loading');
  const [failureMessage, setFailureMessage] = useState<string | undefined>(undefined);
  const [items, setItems] = useState<CatalogActivity[]>([]);
  const [counts, setCounts] = useState<ActivityCounts>({ active: 0, pending: 0, inactive: 0 });
  const [filter, setFilterState] = useState<ActivityFilter>({});
  const [saving, setSaving] = useState(false);

  // Changing what is asked for is what puts the list back into its loading state;
  // the effect below only answers.
  const setFilter = useCallback((update: (current: ActivityFilter) => ActivityFilter) => {
    setState('loading');
    setFilterState(update);
  }, []);

  const load = useCallback((next: ActivityFilter) => readActivities(next), []);

  useEffect(() => {
    let cancelled = false;

    load(filter)
      .then((answer) => {
        if (!cancelled) {
          setItems(answer.items);
          setCounts(answer.counts);
          setState('ready');
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setFailureMessage(presenter.current(error).message);
          setState('failed');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [filter, load]);

  const run = useCallback(
    async (
      write: () => Promise<CatalogActivity | void>,
      toast: string,
      replace?: (current: CatalogActivity[]) => CatalogActivity[],
    ): Promise<CatalogOutcome> => {
      setSaving(true);

      try {
        const answer = await write();

        if (answer !== undefined && replace !== undefined) {
          setItems((current) => replace(current));
        } else if (answer !== undefined) {
          setItems((current) => current.map((row) => (row.id === answer.id ? answer : row)));
        }

        showToast({ tone: 'success', title: toast });

        return { ok: true };
      } catch (error) {
        const shown = presenter.current(error);

        return shown.placement === 'field'
          ? { ok: false, field: shown.field, message: shown.message }
          : { ok: false, message: shown.message };
      } finally {
        setSaving(false);
      }
    },
    [showToast],
  );

  const create = useCallback(
    async (name: string): Promise<CatalogOutcome> => {
      setSaving(true);

      try {
        const created = await createActivity({ name });

        setItems((current) => [...current, created].sort((a, b) => a.name.localeCompare(b.name)));
        setCounts((current) => ({ ...current, active: current.active + 1 }));
        showToast({ tone: 'success', title: translate('created') });

        return { ok: true };
      } catch (error) {
        const shown = presenter.current(error);

        return shown.placement === 'field'
          ? { ok: false, field: shown.field, message: shown.message }
          : { ok: false, message: shown.message };
      } finally {
        setSaving(false);
      }
    },
    [showToast, translate],
  );

  const rename = useCallback(
    (activity: CatalogActivity, name: string) =>
      run(async () => {
        const saved = await updateActivity(activity.id, { name });
        // The saved row carries the state and the count the API holds, which
        // are unchanged by a rename.
        return { ...saved, members: activity.members };
      }, translate('renamed')),
    [run, translate],
  );

  const setStatus = useCallback(
    (activity: CatalogActivity, status: ActivityStatus) =>
      run(
        async () => {
          const saved = await updateActivity(activity.id, { status });
          return { ...saved, members: activity.members };
        },
        translate(status === 'active' ? 'accepted' : 'retired'),
      ),
    [run, translate],
  );

  const remove = useCallback(
    (activity: CatalogActivity) =>
      run(
        () => removeActivity(activity.id),
        translate('removed'),
        (current) => current.filter((row) => row.id !== activity.id),
      ),
    [run, translate],
  );

  return {
    state,
    failureMessage,
    items,
    counts,
    filter,
    setFilter,
    saving,
    create,
    rename,
    setStatus,
    remove,
  };
}
