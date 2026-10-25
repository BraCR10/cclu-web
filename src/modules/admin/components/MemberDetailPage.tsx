'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Alert } from '@/shared/components/Alert';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { DataList, type DataColumn } from '@/shared/components/DataList';
import { DescriptionList, type Description } from '@/shared/components/DescriptionList';
import { Input } from '@/shared/components/Input';
import { Modal } from '@/shared/components/Modal';
import { PageHeader } from '@/shared/components/PageHeader';
import { ReasonDialog } from '@/shared/components/ReasonDialog';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { Tabs } from '@/shared/components/Tabs';
import { useToast } from '@/shared/components/useToast';
import { useDates } from '@/shared/hooks/useDates';
import { formatColones } from '@/shared/utils/formatColones';
import { useErrorPresenter } from '@/shared/errors/useErrorPresenter';
import {
  readMember,
  setMemberStatus,
  updateMember,
  type AccountStatus,
  type MemberDetail,
  type MemberPayment,
  type MemberPublication,
} from '../api/members';

const REASON_LENGTH = { minimum: 10, maximum: 500 };

type Phase = 'loading' | 'failed' | 'ready';
type Decision = 'suspended' | 'active' | null;

// The record as four tabs read it. Everything comes from one answer, so the
// plan, the movements and the publications are all of the same moment.
export function MemberDetailPage({ memberId }: { memberId: string }) {
  const translate = useTranslations('admin.members');
  const dates = useDates();
  const { showToast } = useToast();
  const present = useErrorPresenter();
  const presenter = useRef(present);

  useEffect(() => {
    presenter.current = present;
  });

  const [phase, setPhase] = useState<Phase>('loading');
  const [member, setMember] = useState<MemberDetail | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [decision, setDecision] = useState<Decision>(null);
  const [saving, setSaving] = useState(false);
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [billingEmail, setBillingEmail] = useState('');
  const [fieldError, setFieldError] = useState<{ message: string; field?: string } | null>(null);

  useEffect(() => {
    let cancelled = false;

    readMember(memberId)
      .then((answer) => {
        if (!cancelled) {
          setMember(answer);
          setPhone(answer.phone ?? '');
          setWhatsapp(answer.whatsappNumber ?? '');
          setBillingEmail(answer.billingEmail ?? '');
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

  const saveContact = async () => {
    setSaving(true);

    try {
      const saved = await updateMember(memberId, {
        phone,
        whatsappNumber: whatsapp,
        billingEmail,
      });

      setMember(saved);
      setEditing(false);
      setFieldError(null);
      showToast({ tone: 'success', title: translate('savedContact') });
    } catch (error) {
      const shown = presenter.current(error);

      setFieldError({ message: shown.message, field: 'field' in shown ? shown.field : undefined });
    } finally {
      setSaving(false);
    }
  };

  const decide = async (status: AccountStatus, reason: string) => {
    setSaving(true);

    try {
      setMember(await setMemberStatus(memberId, status, reason));
      setDecision(null);
      showToast({
        tone: 'success',
        title: translate(status === 'suspended' ? 'suspendedToast' : 'reactivatedToast'),
      });
    } catch (error) {
      setProblem(presenter.current(error).message);
    } finally {
      setSaving(false);
    }
  };

  const details: Description[] =
    member === null
      ? []
      : [
          { term: translate('fields.email'), detail: member.email },
          { term: translate('fields.phone'), detail: member.phone ?? '—' },
          { term: translate('fields.whatsapp'), detail: member.whatsappNumber ?? '—' },
          {
            term: translate('fields.identification'),
            detail: `${member.identificationType} ${member.identificationNumber}`,
          },
          ...(member.legalName === null
            ? []
            : [{ term: translate('fields.legalName'), detail: member.legalName }]),
          { term: translate('fields.activity'), detail: member.activity ?? '—' },
          {
            term: translate('fields.location'),
            detail: [member.canton, member.district, member.location]
              .filter((part) => part !== null && part !== '')
              .join(' · '),
          },
          { term: translate('fields.joined'), detail: dates.instant(member.joinedAt) },
        ];

  const paymentColumns: DataColumn<MemberPayment>[] = [
    { id: 'plan', header: translate('payments.plan'), cell: (row) => row.planName },
    {
      id: 'amount',
      header: translate('payments.amount'),
      cell: (row) => formatColones(row.amount),
    },
    { id: 'status', header: translate('payments.status'), cell: (row) => row.status },
    {
      id: 'submitted',
      header: translate('payments.submitted'),
      cell: (row) => dates.instant(row.submittedAt),
    },
  ];

  const publicationColumns: DataColumn<MemberPublication>[] = [
    { id: 'title', header: translate('publications.title'), cell: (row) => row.title },
    { id: 'type', header: translate('publications.type'), cell: (row) => row.type },
    { id: 'status', header: translate('publications.status'), cell: (row) => row.status },
    {
      id: 'published',
      header: translate('publications.published'),
      cell: (row) => dates.instant(row.publishedAt),
    },
  ];

  const suspended = member?.accountStatus === 'suspended';

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:gap-8 lg:px-8 lg:py-8">
      <PageHeader
        title={member?.businessName ?? member?.name ?? translate('detailTitle')}
        legend={translate('detailDescription')}
        backHref="/admin/members"
        backLabel={translate('back')}
      />

      {phase === 'failed' ? (
        <Alert tone="danger" title={translate('loadFailed')} message={problem ?? undefined} />
      ) : null}

      {phase === 'loading' ? (
        <div aria-hidden className="h-40 animate-pulse rounded-lg bg-surface-hover" />
      ) : null}

      {phase === 'ready' && member !== null ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge
                tone={suspended ? 'danger' : 'success'}
                label={translate(`statuses.${member.accountStatus}`)}
              />
              {member.memberCode === null ? null : (
                <span className="text-label-s text-fg-muted">
                  {translate('code', { code: member.memberCode })}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => setEditing(true)}>
                {translate('editContact')}
              </Button>
              <Button
                variant={suspended ? 'primary' : 'danger'}
                disabled={saving}
                onClick={() => setDecision(suspended ? 'active' : 'suspended')}
              >
                {translate(suspended ? 'reactivate' : 'suspend')}
              </Button>
            </div>
          </div>

          <Tabs
            label={translate('tabsLabel')}
            items={[
              {
                id: 'data',
                label: translate('tabs.data'),
                content: (
                  <Card className="p-6 lg:p-8">
                    <DescriptionList items={details} />
                  </Card>
                ),
              },
              {
                id: 'membership',
                label: translate('tabs.membership'),
                content: (
                  <Card className="p-6 lg:p-8">
                    <DescriptionList
                      items={[
                        {
                          term: translate('membership.plan'),
                          detail: member.plan?.name ?? translate('plans.free'),
                        },
                        {
                          term: translate('membership.started'),
                          detail:
                            member.membership === null
                              ? '—'
                              : dates.instant(member.membership.startedAt),
                        },
                        {
                          term: translate('membership.expires'),
                          detail:
                            member.membership?.expiresAt === null ||
                            member.membership?.expiresAt === undefined
                              ? translate('membership.never')
                              : dates.instant(member.membership.expiresAt),
                        },
                      ]}
                    />
                  </Card>
                ),
              },
              {
                id: 'payments',
                label: translate('tabs.payments'),
                content: (
                  <DataList
                    label={translate('tabs.payments')}
                    items={member.payments}
                    keyOf={(row) => row.id}
                    columns={paymentColumns}
                    card={(row) => (
                      <div className="flex justify-between">
                        <span>{row.planName}</span>
                        <span>{formatColones(row.amount)}</span>
                      </div>
                    )}
                  />
                ),
              },
              {
                id: 'publications',
                label: translate('tabs.publications'),
                content: (
                  <DataList
                    label={translate('tabs.publications')}
                    items={member.publications}
                    keyOf={(row) => row.id}
                    columns={publicationColumns}
                    card={(row) => <span>{row.title}</span>}
                  />
                ),
              },
            ]}
          />

          {problem !== null && phase === 'ready' ? <Alert tone="danger" title={problem} /> : null}
        </>
      ) : null}

      <Modal
        open={editing}
        title={translate('editContactTitle')}
        onClose={() => setEditing(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditing(false)}>
              {translate('cancel')}
            </Button>
            <Button disabled={saving} onClick={() => void saveContact()}>
              {translate('save')}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-body-m text-fg-muted">{translate('editContactHelp')}</p>
          <Input
            label={translate('fields.phone')}
            value={phone}
            error={fieldError?.field === 'phone' ? fieldError.message : undefined}
            onChange={(event) => setPhone(event.target.value)}
          />
          <Input
            label={translate('fields.whatsapp')}
            value={whatsapp}
            error={fieldError?.field === 'whatsappNumber' ? fieldError.message : undefined}
            onChange={(event) => setWhatsapp(event.target.value)}
          />
          <Input
            label={translate('fields.billingEmail')}
            type="email"
            value={billingEmail}
            error={fieldError?.field === 'billingEmail' ? fieldError.message : undefined}
            onChange={(event) => setBillingEmail(event.target.value)}
          />
          {fieldError !== null && fieldError.field === undefined ? (
            <Alert tone="danger" title={fieldError.message} />
          ) : null}
        </div>
      </Modal>

      <ReasonDialog
        open={decision !== null}
        title={translate(suspended ? 'reactivateTitle' : 'suspendTitle')}
        description={translate(suspended ? 'reactivateHelp' : 'suspendHelp')}
        label={translate('reasonLabel')}
        confirmLabel={translate(suspended ? 'reactivate' : 'suspend')}
        length={REASON_LENGTH}
        onClose={() => setDecision(null)}
        onConfirm={(reason) => decide(decision ?? 'suspended', reason)}
      />
    </div>
  );
}
