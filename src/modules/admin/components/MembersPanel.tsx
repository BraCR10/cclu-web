'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ToastStack } from '@/shared/components/ToastStack';
import { useToasts } from '@/shared/components/useToasts';
import {
  fetchMembers,
  updateMemberMembership,
  updateMemberStatus,
  type ManagedMember,
  type MembershipChanges,
  type MembershipStatus,
  type MembershipType,
} from '../api/members';
import { MemberRow } from './MemberRow';

type MembersPanelProps = {
  loadMembers?: () => Promise<ManagedMember[]>;
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

const CONTROL_CLASS =
  'rounded-control border border-border bg-surface-raised px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand';

export function MembersPanel({
  loadMembers = fetchMembers,
  saveStatus = updateMemberStatus,
  saveMembership = updateMemberMembership,
}: MembersPanelProps) {
  const [members, setMembers] = useState<ManagedMember[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [search, setSearch] = useState('');
  const [accountFilter, setAccountFilter] = useState<'all' | ManagedMember['accountStatus']>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | MembershipType>('all');
  const [membershipFilter, setMembershipFilter] = useState<'all' | MembershipStatus>('all');
  const { toasts, show, dismiss } = useToasts();

  const notify = useCallback(
    (tone: 'success' | 'info' | 'problem', title: string, detail?: string) =>
      show({ tone, title, detail }),
    [show],
  );

  const read = useCallback(() => loadMembers(), [loadMembers]);

  useEffect(() => {
    let stillMounted = true;

    read()
      .then((found) => {
        if (stillMounted) {
          setMembers(found);
        }
      })
      .catch(() => {
        if (stillMounted) {
          setLoadFailed(true);
        }
      });

    return () => {
      stillMounted = false;
    };
  }, [read]);

  function handleStatusUpdated(memberId: string, accountStatus: ManagedMember['accountStatus']) {
    setMembers((current) =>
      current === null
        ? current
        : current.map((member) =>
            member.id === memberId
              ? {
                  ...member,
                  accountStatus,
                  state: accountStatus,
                }
              : member,
          ),
    );
  }

  function handleMembershipUpdated(memberId: string, membership: ManagedMember['membership']) {
    setMembers((current) =>
      current === null
        ? current
        : current.map((member) => (member.id === memberId ? { ...member, membership } : member)),
    );
  }

  const filtered = useMemo(() => {
    if (members === null) {
      return [];
    }

    const query = search.trim().toLowerCase();

    return members.filter((member) => {
      const matchesSearch =
        query === '' ||
        member.businessName.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        (member.memberCode ?? '').toLowerCase().includes(query);
      const matchesAccount = accountFilter === 'all' || member.state === accountFilter;
      const matchesType = typeFilter === 'all' || member.membership?.type === typeFilter;
      const matchesMembership =
        membershipFilter === 'all' || member.membership?.status === membershipFilter;

      return matchesSearch && matchesAccount && matchesType && matchesMembership;
    });
  }, [members, search, accountFilter, typeFilter, membershipFilter]);

  if (loadFailed) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-panel border border-border bg-surface-raised p-6">
        <p role="alert" className="text-sm">
          No fue posible cargar los agremiados.
        </p>
        <button
          type="button"
          onClick={() => {
            setLoadFailed(false);
            setMembers(null);
            read()
              .then(setMembers)
              .catch(() => setLoadFailed(true));
          }}
          className="rounded-control bg-brand px-4 py-2 text-sm font-medium text-on-brand"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (members === null) {
    return <p className="text-sm text-content-muted">Cargando agremiados…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <ToastStack toasts={toasts} onDismiss={dismiss} />

      <section className="flex flex-col gap-4 rounded-panel border border-border bg-surface-raised p-5">
        <label className="flex flex-col gap-2 text-sm font-medium">
          Buscar agremiado
          <input
            type="search"
            aria-label="Buscar agremiado"
            placeholder="Nombre, correo o código…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className={CONTROL_CLASS}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm font-medium">
            Estado de la cuenta
            <select
              aria-label="Filtrar por estado de cuenta"
              value={accountFilter}
              onChange={(event) =>
                setAccountFilter(event.target.value as 'all' | ManagedMember['accountStatus'])
              }
              className={CONTROL_CLASS}
            >
              <option value="all">Todos</option>
              {(['active', 'suspended', 'terminated'] as const).map((status) => (
                <option key={status} value={status}>
                  {ACCOUNT_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium">
            Tipo de membresía
            <select
              aria-label="Filtrar por tipo de membresía"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value as 'all' | MembershipType)}
              className={CONTROL_CLASS}
            >
              <option value="all">Todas</option>
              {(['free', 'paid'] as const).map((type) => (
                <option key={type} value={type}>
                  {MEMBERSHIP_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium">
            Estado de la membresía
            <select
              aria-label="Filtrar por estado de membresía"
              value={membershipFilter}
              onChange={(event) =>
                setMembershipFilter(event.target.value as 'all' | MembershipStatus)
              }
              className={CONTROL_CLASS}
            >
              <option value="all">Todos</option>
              {(['active', 'inactive', 'terminated'] as const).map((status) => (
                <option key={status} value={status}>
                  {MEMBERSHIP_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {filtered.length === 0 ? (
        <div className="rounded-panel border border-dashed border-border p-12 text-center">
          <p className="font-medium">Ningún agremiado coincide con la búsqueda.</p>
          <p className="mt-2 text-sm text-content-muted">
            Pruebe con otro nombre, correo o código, o cambie los filtros.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {filtered.map((member) => (
            <li key={member.id}>
              <MemberRow
                member={member}
                onStatusUpdated={handleStatusUpdated}
                onMembershipUpdated={handleMembershipUpdated}
                notify={notify}
                saveStatus={saveStatus}
                saveMembership={saveMembership}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
