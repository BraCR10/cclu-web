'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Alert } from '@/shared/components/Alert';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { DescriptionList, type Description } from '@/shared/components/DescriptionList';
import { Modal } from '@/shared/components/Modal';
import { PageHeader } from '@/shared/components/PageHeader';
import { ReasonDialog } from '@/shared/components/ReasonDialog';
import { useToast } from '@/shared/components/useToast';
import { useDates } from '@/shared/hooks/useDates';
import { buildApiUrl } from '@/shared/api/apiUrl';
import { useErrorPresenter } from '@/shared/errors/useErrorPresenter';
import {
  applicationFileUrl,
  approveApplication,
  readApplication,
  rejectApplication,
  requestChangesApplication,
  type ApplicationDetail,
} from '../api/applications';
import { ApplicationStatusBadge } from './ApplicationsPage';

const REASON_LENGTH = { minimum: 10, maximum: 500 };

type Phase = 'loading' | 'failed' | 'ready';
type Decision = 'approve' | 'reject' | 'changes' | null;

// The application as the reviewer reads it: who applied, what the business is,
// where it is, how to reach them, and the documents. The decision is taken from
// here, and once taken the screen says what was decided instead of offering it
// again.
export function ApplicationDetailPage({ memberId }: { memberId: string }) {
  const translate = useTranslations('admin.applications');
  const dates = useDates();
  const { showToast } = useToast();
  const present = useErrorPresenter();
  const presenter = useRef(present);

  useEffect(() => {
    presenter.current = present;
  });

  const [phase, setPhase] = useState<Phase>('loading');
  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [decision, setDecision] = useState<Decision>(null);

  useEffect(() => {
    let cancelled = false;

    readApplication(memberId)
      .then((answer) => {
        if (!cancelled) {
          setApplication(answer);
          setPhase('ready');
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setProblem(presenter.current(error).message);
          setPhase('failed');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [memberId]);

  const decide = async (write: () => Promise<ApplicationDetail>, toast: string) => {
    setBusy(true);

    try {
      const saved = await write();

      setApplication(saved);
      setDecision(null);
      showToast({ tone: 'success', title: toast });
    } catch (error) {
      const shown = presenter.current(error);

      setProblem(shown.message);
    } finally {
      setBusy(false);
    }
  };

  const open = application !== null;
  const decidable =
    application !== null &&
    (application.applicationStatus === 'pending_review' ||
      application.applicationStatus === 'changes_requested');

  const sections: Description[] = !open
    ? []
    : [
        { term: translate('fields.email'), detail: application.email },
        { term: translate('fields.phone'), detail: application.phone ?? '—' },
        { term: translate('fields.whatsapp'), detail: application.whatsappNumber ?? '—' },
        {
          term: translate('fields.identification'),
          detail: `${application.identificationType} ${application.identificationNumber}`,
        },
        ...(application.legalName === null || application.legalName === undefined
          ? []
          : [{ term: translate('fields.legalName'), detail: application.legalName }]),
        ...(application.legalRepresentativeName === null ||
        application.legalRepresentativeName === undefined
          ? []
          : [
              {
                term: translate('fields.representative'),
                detail: application.legalRepresentativeName,
              },
            ]),
        {
          term: translate('fields.activity'),
          detail:
            application.activity?.name ?? application.activityOther ?? translate('noActivity'),
        },
        {
          term: translate('fields.location'),
          detail: [application.canton?.name, application.district, application.location]
            .filter((part) => part !== null && part !== undefined && part !== '')
            .join(' · '),
        },
        { term: translate('fields.received'), detail: dates.instant(application.createdAt) },
      ];

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:gap-8 lg:px-8 lg:py-8">
      <PageHeader
        title={application?.businessName ?? application?.name ?? translate('detailTitle')}
        legend={translate('detailDescription')}
        backHref="/admin/applications"
        backLabel={translate('back')}
      />

      {phase === 'failed' ? (
        <Alert tone="danger" title={translate('loadFailed')} message={problem ?? undefined} />
      ) : null}

      {phase === 'loading' ? (
        <div aria-hidden className="h-40 animate-pulse rounded-lg bg-surface-hover" />
      ) : null}

      {phase === 'ready' && application !== null ? (
        <>
          <Card className="p-6 lg:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-heading-m text-fg">{translate('summaryTitle')}</h2>
              <ApplicationStatusBadge status={application.applicationStatus} />
            </div>
            <div className="mt-4">
              <DescriptionList items={sections} />
            </div>
            {application.statusReason !== null && application.statusReason !== undefined ? (
              <div className="mt-4">
                <Alert
                  tone="info"
                  title={translate('reasonTitle')}
                  message={application.statusReason}
                />
              </div>
            ) : null}
          </Card>

          <Card className="p-6 lg:p-8">
            <h2 className="text-heading-m text-fg">{translate('documentsTitle')}</h2>
            <p className="mt-1 text-body-m text-fg-secondary">{translate('documentsHelp')}</p>
            <div className="mt-4 flex flex-col gap-2">
              {application.certificationFileKey !== null &&
              application.certificationFileKey !== undefined ? (
                <a
                  className="text-body-m text-link underline"
                  href={buildApiUrl(applicationFileUrl(application.certificationFileKey))}
                  target="_blank"
                  rel="noreferrer"
                >
                  {translate('certification')}
                </a>
              ) : (
                <p className="text-body-m text-fg-muted">{translate('noCertification')}</p>
              )}
              {application.logoFileKey !== null && application.logoFileKey !== undefined ? (
                <a
                  className="text-body-m text-link underline"
                  href={buildApiUrl(applicationFileUrl(application.logoFileKey))}
                  target="_blank"
                  rel="noreferrer"
                >
                  {translate('logo')}
                </a>
              ) : null}
            </div>
          </Card>

          {decidable ? (
            <Card className="p-6 lg:p-8">
              <h2 className="text-heading-m text-fg">{translate('decideTitle')}</h2>
              <p className="mt-1 text-body-m text-fg-secondary">{translate('decideHelp')}</p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Button disabled={busy} onClick={() => setDecision('approve')}>
                  {translate('approve')}
                </Button>
                <Button variant="secondary" disabled={busy} onClick={() => setDecision('changes')}>
                  {translate('requestChanges')}
                </Button>
                <Button variant="danger" disabled={busy} onClick={() => setDecision('reject')}>
                  {translate('reject')}
                </Button>
              </div>

              {problem !== null ? (
                <div className="mt-4">
                  <Alert tone="danger" title={problem} />
                </div>
              ) : null}
            </Card>
          ) : null}

          {!decidable ? (
            <p className="text-body-m text-fg-muted">
              {translate('alreadyDecided')}{' '}
              <Link className="text-link underline" href="/admin/applications">
                {translate('back')}
              </Link>
            </p>
          ) : null}
        </>
      ) : null}

      <Modal
        open={decision === 'approve'}
        title={translate('approveTitle')}
        onClose={() => setDecision(null)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDecision(null)}>
              {translate('cancel')}
            </Button>
            <Button
              disabled={busy}
              onClick={() => void decide(() => approveApplication(memberId), translate('approved'))}
            >
              {translate('approve')}
            </Button>
          </div>
        }
      >
        <p className="text-body-m text-fg-secondary">{translate('approveHelp')}</p>
      </Modal>

      <ReasonDialog
        open={decision === 'reject'}
        title={translate('rejectTitle')}
        description={translate('rejectHelp')}
        label={translate('reasonLabel')}
        confirmLabel={translate('reject')}
        length={REASON_LENGTH}
        onClose={() => setDecision(null)}
        onConfirm={(reason) =>
          decide(() => rejectApplication(memberId, reason), translate('rejected'))
        }
      />

      <ReasonDialog
        open={decision === 'changes'}
        title={translate('changesTitle')}
        description={translate('changesHelp')}
        label={translate('reasonLabel')}
        confirmLabel={translate('requestChanges')}
        length={REASON_LENGTH}
        onClose={() => setDecision(null)}
        onConfirm={(reason) =>
          decide(() => requestChangesApplication(memberId, reason), translate('changesRequested'))
        }
      />
    </div>
  );
}
