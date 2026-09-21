'use client';

import { useState, type FormEvent } from 'react';
import { formatMemberCode } from '@/shared/format';
import { CONTROL_CLASS } from '@/shared/components/Field';
import { MESSAGES, messageForError } from '@/shared/config/messages';
import {
  updateMemberMembership as updateMembershipThroughApi,
  updateMemberStatus as updateStatusThroughApi,
  type ManagedMember,
  type MembershipChanges,
  type MembershipStatus,
  type MembershipType,
} from '../api/members';

const ACCOUNT_STATUS_LABELS: Record<ManagedMember['accountStatus'], string> = {
  active: 'Activa',
  suspended: 'Suspendida',
  terminated: 'Terminada',
};

const MEMBERSHIP_TYPE_LABELS: Record<MembershipType, string> = {
  free: 'Gratuita',
  paid: 'Pagada',
};

const MEMBERSHIP_STATUS_LABELS: Record<MembershipStatus, string> = {
  active: 'Activa',
  inactive: 'Inactiva',
  terminated: 'Terminada',
};

const ACCOUNT_STATUSES: ManagedMember['accountStatus'][] = ['active', 'suspended', 'terminated'];
const MEMBERSHIP_TYPES: MembershipType[] = ['free', 'paid'];
const MEMBERSHIP_STATUSES: MembershipStatus[] = ['active', 'inactive', 'terminated'];

function toDateInputValue(value: string | null): string {
  if (value === null || value === '') {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);

  return local.toISOString().slice(0, 10);
}

function fromDateInputValue(value: string): string | null {
  if (value === '') {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function describeMembership(member: ManagedMember): string {
  if (member.membership === null) {
    return 'Sin membresía';
  }

  const parts = [
    MEMBERSHIP_TYPE_LABELS[member.membership.type],
    MEMBERSHIP_STATUS_LABELS[member.membership.status].toLowerCase(),
  ];

  return parts.join(' · ');
}

type MemberRowProps = {
  member: ManagedMember;
  onStatusUpdated: (memberId: string, status: ManagedMember['accountStatus']) => void;
  onMembershipUpdated: (memberId: string, membership: ManagedMember['membership']) => void;
  notify: (tone: 'success' | 'info' | 'problem', title: string, detail?: string) => void;
  saveStatus?: (
    memberId: string,
    accountStatus: ManagedMember['accountStatus'],
  ) => Promise<{ id: string; accountStatus: string; state: string }>;
  saveMembership?: (
    memberId: string,
    changes: MembershipChanges,
  ) => Promise<{
    id: string;
    memberId: string;
    type: string;
    status: string;
    expiresAt: string | null;
  }>;
};

export function MemberRow({
  member,
  onStatusUpdated,
  onMembershipUpdated,
  notify,
  saveStatus = updateStatusThroughApi,
  saveMembership = updateMembershipThroughApi,
}: MemberRowProps) {
  const [statusBusy, setStatusBusy] = useState(false);
  const [membershipBusy, setMembershipBusy] = useState(false);
  const [membershipType, setMembershipType] = useState<MembershipType>(
    member.membership?.type ?? 'free',
  );
  const [membershipStatus, setMembershipStatus] = useState<MembershipStatus>(
    member.membership?.status ?? 'active',
  );
  const [expiresAt, setExpiresAt] = useState(
    toDateInputValue(member.membership?.expiresAt ?? null),
  );

  async function handleStatusChange(status: ManagedMember['accountStatus']) {
    if (status === member.accountStatus) {
      return;
    }

    setStatusBusy(true);

    try {
      await saveStatus(member.id, status);
      onStatusUpdated(member.id, status);
      notify(
        'success',
        `El estado de ${member.businessName} quedó ${ACCOUNT_STATUS_LABELS[status].toLowerCase()}`,
      );
    } catch (caught) {
      notify('problem', messageForError(caught, { fallback: MESSAGES.save_unavailable }));
    } finally {
      setStatusBusy(false);
    }
  }

  async function handleMembershipSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextExpiresAt = fromDateInputValue(expiresAt);
    const current = member.membership;

    const unchanged =
      current !== null &&
      current.type === membershipType &&
      current.status === membershipStatus &&
      (current.expiresAt === null || toDateInputValue(current.expiresAt) === expiresAt);

    if (unchanged) {
      notify('info', MESSAGES.nothing_to_change);
      return;
    }

    setMembershipBusy(true);

    try {
      const saved = await saveMembership(member.id, {
        type: membershipType,
        status: membershipStatus,
        expiresAt: nextExpiresAt,
      });

      onMembershipUpdated(member.id, {
        type: saved.type as MembershipType,
        status: saved.status as MembershipStatus,
        expiresAt: saved.expiresAt,
      });
      notify('success', `La membresía de ${member.businessName} quedó actualizada`);
    } catch (caught) {
      notify('problem', messageForError(caught, { fallback: MESSAGES.save_unavailable }));
    } finally {
      setMembershipBusy(false);
    }
  }

  return (
    <article className="flex flex-col gap-5 rounded-panel border border-border bg-surface-raised p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold tracking-tight">{member.businessName}</h3>
            {member.memberCode !== null && (
              <span className="rounded-pill bg-surface px-2.5 py-0.5 font-mono text-xs text-content-muted">
                {formatMemberCode(member.memberCode)}
              </span>
            )}
          </div>
          <p className="truncate text-sm text-content-muted">{member.email}</p>
        </div>

        <span className="rounded-pill border border-border px-3 py-1 text-xs font-medium text-content-muted">
          {describeMembership(member)}
        </span>
      </div>

      <div className="grid gap-5 border-t border-border pt-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <label className="flex flex-col gap-2 text-sm font-medium">
          Estado de la cuenta
          <select
            aria-label={`Cambiar estado de ${member.businessName}`}
            value={member.accountStatus}
            disabled={statusBusy}
            onChange={(event) =>
              handleStatusChange(event.target.value as ManagedMember['accountStatus'])
            }
            className={CONTROL_CLASS}
          >
            {ACCOUNT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {ACCOUNT_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </label>

        <form onSubmit={handleMembershipSubmit} className="flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="flex flex-col gap-2 text-sm font-medium">
              Tipo de membresía
              <select
                aria-label={`Cambiar tipo de membresía de ${member.businessName}`}
                value={membershipType}
                disabled={membershipBusy}
                onChange={(event) => setMembershipType(event.target.value as MembershipType)}
                className={CONTROL_CLASS}
              >
                {MEMBERSHIP_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {MEMBERSHIP_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium">
              Estado de la membresía
              <select
                aria-label={`Cambiar estado de membresía de ${member.businessName}`}
                value={membershipStatus}
                disabled={membershipBusy}
                onChange={(event) => setMembershipStatus(event.target.value as MembershipStatus)}
                className={CONTROL_CLASS}
              >
                {MEMBERSHIP_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {MEMBERSHIP_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium">
              Vence el
              <input
                type="date"
                aria-label={`Fecha de vencimiento de ${member.businessName}`}
                value={expiresAt}
                disabled={membershipBusy}
                onChange={(event) => setExpiresAt(event.target.value)}
                className={CONTROL_CLASS}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={membershipBusy}
            className="w-fit rounded-control bg-brand px-4 py-2 text-sm font-medium text-on-brand disabled:opacity-60"
          >
            {membershipBusy ? 'Guardando…' : 'Guardar membresía'}
          </button>
        </form>
      </div>
    </article>
  );
}
