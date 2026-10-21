'use client';

import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/shared/components/useToast';
import { useErrorPresenter } from '@/shared/errors/useErrorPresenter';
import { readStore, saveStore, type Store, type StoreChanges } from '../api/store';
import { readActivities, type CatalogActivity } from '../api/registration';

export type StoreState = 'loading' | 'failed' | 'ready';

export type StoreOutcome = { ok: true } | { ok: false; message: string; field?: string };

type Loaded = { state: StoreState; failureMessage?: string; store: Store | null };

export function useStore(onSaved: string) {
  const present = useErrorPresenter();
  const { showToast } = useToast();

  const [loaded, setLoaded] = useState<Loaded>({ state: 'loading', store: null });
  const [activities, setActivities] = useState<CatalogActivity[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.all([readStore(), readActivities()])
      .then(([store, activityList]) => {
        if (!cancelled) {
          setActivities(activityList);
          setLoaded({ state: 'ready', store });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoaded({ state: 'failed', failureMessage: present(error).message, store: null });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [present]);

  const save = useCallback(
    async (changes: StoreChanges): Promise<StoreOutcome> => {
      setSaving(true);

      try {
        const store = await saveStore(changes);

        setLoaded({ state: 'ready', store });
        showToast({ tone: 'success', title: onSaved });

        return { ok: true };
      } catch (error) {
        const presented = present(error);

        if (presented.placement === 'field') {
          return { ok: false, field: presented.field, message: presented.message };
        }

        return { ok: false, message: presented.message };
      } finally {
        setSaving(false);
      }
    },
    [onSaved, present, showToast],
  );

  return { ...loaded, activities, saving, save };
}
