'use client';

import { useCallback, useEffect, useState } from 'react';
import { formatMemberCode } from '@/shared/format';
import { ToastStack } from '@/shared/components/ToastStack';
import { useToasts } from '@/shared/components/useToasts';
import {
  approveApplication as approveThroughApi,
  fetchDecidedApplications,
  fetchPendingApplications,
  rejectApplication as rejectThroughApi,
  type ApplicationDecision,
  type DecidedApplication,
  type PendingApplication,
} from '../api/applications';
import { DECISION_MESSAGES, decisionMessageFor } from '../applicationRules';
import { ApplicationCard } from './ApplicationCard';
import { DecidedApplicationCard } from './DecidedApplicationCard';
import { StatusTabs, type InboxView } from './StatusTabs';

type Loaded = { pending: PendingApplication[]; decided: DecidedApplication[] };
type LoadResult = Loaded | { error: string };

type ApplicationInboxProps = {
  loadApplications?: () => Promise<PendingApplication[]>;
  loadDecided?: () => Promise<DecidedApplication[]>;
  approve?: (memberId: string) => Promise<ApplicationDecision>;
  reject?: (memberId: string, reason: string) => Promise<ApplicationDecision>;
};

const EMPTY_MESSAGES: Record<InboxView, { title: string; detail: string }> = {
  pending: {
    title: 'No hay solicitudes pendientes.',
    detail: 'Aquí aparecerán las nuevas solicitudes de afiliación, la más antigua primero.',
  },
  approved: {
    title: 'Todavía no se ha aprobado ninguna solicitud.',
    detail: 'Cuando apruebe una, quedará aquí con su código de agremiado y la fecha.',
  },
  rejected: {
    title: 'Todavía no se ha rechazado ninguna solicitud.',
    detail: 'Cuando rechace una, quedará aquí junto al motivo que escribió.',
  },
};

export function ApplicationInbox({
  loadApplications = fetchPendingApplications,
  loadDecided = fetchDecidedApplications,
  approve = approveThroughApi,
  reject = rejectThroughApi,
}: ApplicationInboxProps) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [view, setView] = useState<InboxView>('pending');
  const { toasts, show, dismiss } = useToasts();

  const read = useCallback(async (): Promise<LoadResult> => {
    try {
      const [pending, decided] = await Promise.all([loadApplications(), loadDecided()]);

      return { pending, decided };
    } catch {
      return { error: DECISION_MESSAGES.listUnavailable };
    }
    // Both loaders are read once. Depending on them would reload on every render
    // that passed new functions and undo a decision that had just landed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const apply = useCallback((result: LoadResult) => {
    setLoaded('error' in result ? null : result);
    setLoadError('error' in result ? result.error : null);
  }, []);

  const reload = useCallback(async () => {
    apply(await read());
  }, [apply, read]);

  useEffect(() => {
    let stillMounted = true;

    read().then((result) => {
      if (stillMounted) {
        apply(result);
      }
    });

    return () => {
      stillMounted = false;
    };
  }, [apply, read]);

  function forgetPending(memberId: string) {
    setLoaded((current) =>
      current === null
        ? current
        : { ...current, pending: current.pending.filter((entry) => entry._id !== memberId) },
    );
  }

  async function decide(
    application: PendingApplication,
    run: () => Promise<ApplicationDecision>,
    announce: (decision: ApplicationDecision) => { title: string; detail?: string },
  ) {
    setBusyId(application._id);

    try {
      const decision = await run();

      forgetPending(application._id);
      show({ tone: 'success', ...announce(decision) });
    } catch (caught) {
      show({
        tone: 'problem',
        title: 'No se completó la decisión',
        detail: decisionMessageFor(caught),
      });
    } finally {
      setBusyId(null);
    }

    // Whether it succeeded or a race took it, the three counts now come from
    // the database rather than from what this screen believed.
    await reload();
  }

  if (loaded === null && loadError === null) {
    return <p className="text-sm text-content-muted">Cargando solicitudes…</p>;
  }

  if (loadError !== null) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-panel border border-border bg-surface-raised p-6">
        <p role="alert" className="text-sm">
          {loadError}
        </p>
        <button
          type="button"
          onClick={reload}
          className="rounded-control bg-brand px-4 py-2 text-sm font-medium text-on-brand"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const pending = loaded?.pending ?? [];
  const decided = loaded?.decided ?? [];
  const approved = decided.filter((entry) => entry.applicationStatus === 'approved');
  const rejected = decided.filter((entry) => entry.applicationStatus === 'rejected');
  const shown = view === 'approved' ? approved : view === 'rejected' ? rejected : [];
  const empty = EMPTY_MESSAGES[view];

  return (
    <div className="flex flex-col gap-8">
      <ToastStack toasts={toasts} onDismiss={dismiss} />

      <StatusTabs
        active={view}
        counts={{ pending: pending.length, approved: approved.length, rejected: rejected.length }}
        onSelect={setView}
      />

      {view === 'pending' && pending.length > 0 && (
        <ul className="flex flex-col gap-5">
          {pending.map((application, index) => (
            <li key={application._id}>
              <ApplicationCard
                application={application}
                position={index + 1}
                busy={busyId === application._id}
                onApprove={() =>
                  decide(
                    application,
                    () => approve(application._id),
                    (decision) => ({
                      title: `Se aprobó ${application.businessName}`,
                      detail:
                        decision.memberCode === undefined
                          ? undefined
                          : `Código de agremiado ${formatMemberCode(decision.memberCode)}`,
                    }),
                  )
                }
                onReject={(reason) =>
                  decide(
                    application,
                    () => reject(application._id, reason),
                    () => ({
                      title: `Se rechazó ${application.businessName}`,
                      detail: reason,
                    }),
                  )
                }
              />
            </li>
          ))}
        </ul>
      )}

      {view !== 'pending' && shown.length > 0 && (
        <ul className="flex flex-col gap-4">
          {shown.map((application) => (
            <li key={application._id}>
              <DecidedApplicationCard application={application} />
            </li>
          ))}
        </ul>
      )}

      {(view === 'pending' ? pending.length : shown.length) === 0 && (
        <div className="rounded-panel border border-dashed border-border p-12 text-center">
          <p className="font-medium">{empty.title}</p>
          <p className="mt-2 text-sm text-content-muted">{empty.detail}</p>
        </div>
      )}
    </div>
  );
}
