'use client';

import { useState } from 'react';
import { Clock, Lock, MapPin, Pencil, Phone, Store, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Alert } from '@/shared/components/Alert';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Modal } from '@/shared/components/Modal';
import { StatusBadge } from '@/shared/components/StatusBadge';
import type { Branch, BranchDraft } from '../api/branches';
import { useBranches } from '../hooks/useBranches';
import { BranchModal } from './BranchModal';
import { ProfileTabs } from './ProfileTabs';

function addressOf(branch: Branch): string {
  return [branch.canton?.name, branch.district, branch.address]
    .filter((part) => part !== null && part !== undefined && part !== '')
    .join(', ');
}

// M-02-sucursales and M-02c: the places the chamber affiliates, each with what a
// client needs to reach it.
export function BranchesPage() {
  const translate = useTranslations('member.branches');
  const branches = useBranches();
  const [editing, setEditing] = useState<{ branch: Branch | null } | null>(null);
  const [closing, setClosing] = useState<Branch | null>(null);
  const [closeError, setCloseError] = useState<string | null>(null);

  // The API refuses to leave a member with nowhere to be found, so the screen
  // does not offer it in the first place.
  const canClose = branches.branches.length > 1;

  async function save(draft: BranchDraft) {
    return editing?.branch == null ? branches.add(draft) : branches.edit(editing.branch.id, draft);
  }

  async function close() {
    if (closing === null) {
      return;
    }

    setCloseError(null);

    const outcome = await branches.close(closing.id);

    if (outcome.ok) {
      setClosing(null);
    } else {
      setCloseError(outcome.message);
    }
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:gap-8 lg:px-8 lg:py-8">
      <ProfileTabs active="branches" />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-body-m text-fg-secondary">{translate('description')}</p>
        <Button type="button" onClick={() => setEditing({ branch: null })}>
          {translate('add')}
        </Button>
      </div>

      {branches.state === 'loading' && (
        <div aria-hidden className="grid gap-4 lg:grid-cols-2">
          <div className="h-56 animate-pulse rounded-lg bg-surface-hover" />
          <div className="h-56 animate-pulse rounded-lg bg-surface-hover" />
        </div>
      )}

      {branches.state === 'failed' && (
        <Alert tone="danger" title={branches.failureMessage ?? translate('failed')} />
      )}

      {branches.state === 'ready' && (
        <ul className="grid gap-4 lg:grid-cols-2">
          {branches.branches.map((branch) => (
            <li key={branch.id}>
              <Card className="flex h-full flex-col gap-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 className="text-heading-m text-fg">{branch.name}</h2>
                  {branch.isPrimary && <StatusBadge tone="info" label={translate('primary')} />}
                </div>

                <p className="flex gap-2 text-body-m text-fg-secondary">
                  <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-fg-muted" />
                  {addressOf(branch)}
                </p>

                {branch.phone !== null && (
                  <p className="flex gap-2 text-body-m text-fg-secondary">
                    <Phone aria-hidden className="mt-0.5 size-4 shrink-0 text-fg-muted" />
                    {branch.phone}
                  </p>
                )}

                {branch.schedule !== null && (
                  <p className="flex gap-2 text-body-m text-fg-secondary">
                    <Clock aria-hidden className="mt-0.5 size-4 shrink-0 text-fg-muted" />
                    {branch.schedule}
                  </p>
                )}

                {branch.activity !== null && (
                  <p className="flex gap-2 text-body-m text-fg-secondary">
                    <Store aria-hidden className="mt-0.5 size-4 shrink-0 text-fg-muted" />
                    {translate('activity', { name: branch.activity.name })}
                  </p>
                )}

                {branch.municipalPermit !== null && (
                  <div>
                    <p className="flex gap-2 text-body-m text-fg-secondary">
                      <Lock aria-hidden className="mt-0.5 size-4 shrink-0 text-fg-muted" />
                      {translate('permit', { number: branch.municipalPermit })}
                    </p>
                    <p className="mt-1 pl-6 text-body-s text-fg-muted">{translate('permitNote')}</p>
                  </div>
                )}

                <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
                  <Button type="button" variant="secondary" onClick={() => setEditing({ branch })}>
                    <Pencil aria-hidden className="size-4" />
                    {translate('edit')}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={!canClose}
                    onClick={() => {
                      setCloseError(null);
                      setClosing(branch);
                    }}
                  >
                    <Trash2 aria-hidden className="size-4" />
                    {translate('close')}
                  </Button>
                </div>

                {!canClose && <p className="text-body-s text-fg-muted">{translate('keepOne')}</p>}
              </Card>
            </li>
          ))}
        </ul>
      )}

      {editing !== null && (
        <BranchModal
          branch={editing.branch}
          cantons={branches.cantons}
          activities={branches.activities}
          saving={branches.saving}
          onSave={save}
          onClose={() => setEditing(null)}
        />
      )}

      {closing !== null && (
        <Modal
          open
          title={translate('closeTitle', { name: closing.name })}
          onClose={() => setClosing(null)}
          footer={
            <div className="flex items-center justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setClosing(null)}>
                {translate('cancel')}
              </Button>
              <Button
                type="button"
                variant="danger"
                loading={branches.saving}
                onClick={() => void close()}
              >
                {translate('close')}
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-4">
            {closeError !== null && <Alert tone="danger" title={closeError} />}
            <p className="text-body-m text-fg-secondary">{translate('closeMessage')}</p>
          </div>
        </Modal>
      )}
    </div>
  );
}
