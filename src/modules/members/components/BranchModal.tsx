'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Alert } from '@/shared/components/Alert';
import { Button } from '@/shared/components/Button';
import { Combobox } from '@/shared/components/Combobox';
import { Input } from '@/shared/components/Input';
import { Modal } from '@/shared/components/Modal';
import { Select } from '@/shared/components/Select';
import type { Branch, BranchDraft } from '../api/branches';
import type { CatalogActivity, CatalogCanton } from '../api/registration';
import type { BranchOutcome } from '../hooks/useBranches';

type BranchModalProps = {
  // Null adds one; a branch edits it.
  branch: Branch | null;
  cantons: CatalogCanton[];
  activities: CatalogActivity[];
  saving: boolean;
  onSave: (draft: BranchDraft) => Promise<BranchOutcome>;
  onClose: () => void;
};

function draftOf(branch: Branch | null, defaultCanton: string): BranchDraft {
  return {
    name: branch?.name ?? '',
    isPrimary: branch?.isPrimary ?? false,
    canton: branch?.canton?._id ?? defaultCanton,
    district: branch?.district ?? '',
    address: branch?.address ?? '',
    phone: branch?.phone ?? '',
    schedule: branch?.schedule ?? '',
    municipalPermit: branch?.municipalPermit ?? '',
    activity: branch?.activity?._id ?? '',
  };
}

// The popup the prototype draws for a branch: where it is, how to reach it, its
// hours, the permit the chamber checks, and the activity when it trades under
// one of its own.
export function BranchModal({
  branch,
  cantons,
  activities,
  saving,
  onSave,
  onClose,
}: BranchModalProps) {
  const translate = useTranslations('member.branches');
  const translateFields = useTranslations('member.branches.fields');

  const provinces = [...new Set(cantons.map((canton) => canton.province))].sort();
  const [draft, setDraft] = useState<BranchDraft>(() =>
    draftOf(branch, cantons.length === 1 ? cantons[0]._id : ''),
  );
  const [province, setProvince] = useState(
    branch?.canton?.province ?? (cantons.length === 1 ? cantons[0].province : ''),
  );
  const [error, setError] = useState<{ message: string; field?: string } | null>(null);

  // With no province chosen yet, every cantón is on the list rather than none:
  // the pair is a filter, not a requirement to choose in order.
  const visibleCantons = province === '' ? cantons : cantons.filter((c) => c.province === province);

  const change = (field: keyof BranchDraft, value: string | boolean) =>
    setDraft((current) => ({ ...current, [field]: value }));

  const errorFor = (field: string) => (error?.field === field ? error.message : undefined);

  async function submit() {
    setError(null);

    const outcome = await onSave(draft);

    if (outcome.ok) {
      onClose();
    } else {
      setError(outcome);
    }
  }

  return (
    <Modal
      open
      title={translate(branch === null ? 'addTitle' : 'editTitle')}
      onClose={onClose}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            {translate('cancel')}
          </Button>
          <Button type="button" loading={saving} onClick={() => void submit()}>
            {translate('save')}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-body-m text-fg-secondary">{translate('modalIntro')}</p>

        {error !== null && error.field === undefined && (
          <Alert tone="danger" title={error.message} />
        )}

        <Input
          label={translateFields('name')}
          name="name"
          value={draft.name}
          error={errorFor('name')}
          onChange={(event) => change('name', event.target.value)}
        />

        <label className="flex items-center gap-3 text-body-m text-fg">
          <input
            type="checkbox"
            name="isPrimary"
            checked={draft.isPrimary}
            onChange={(event) => change('isPrimary', event.target.checked)}
            className="size-4 accent-primary"
          />
          {translateFields('isPrimary')}
        </label>

        <Select
          label={translateFields('province')}
          name="province"
          placeholder={translateFields('provincePlaceholder')}
          options={provinces.map((name) => ({ value: name, label: name }))}
          value={province}
          onChange={(event) => {
            setProvince(event.target.value);
            change('canton', '');
          }}
        />

        <Select
          label={translateFields('canton')}
          name="canton"
          placeholder={translateFields('cantonPlaceholder')}
          options={visibleCantons.map((canton) => ({ value: canton._id, label: canton.name }))}
          value={draft.canton}
          error={errorFor('canton')}
          onChange={(event) => change('canton', event.target.value)}
        />

        <Input
          label={translateFields('district')}
          name="district"
          value={draft.district}
          error={errorFor('district')}
          onChange={(event) => change('district', event.target.value)}
        />

        <Input
          label={translateFields('address')}
          name="address"
          value={draft.address}
          error={errorFor('address')}
          onChange={(event) => change('address', event.target.value)}
        />

        <Input
          label={translateFields('phone')}
          help={translateFields('phoneHelp')}
          name="phone"
          inputMode="tel"
          value={draft.phone}
          error={errorFor('phone')}
          onChange={(event) => change('phone', event.target.value)}
        />

        <Input
          label={translateFields('schedule')}
          help={translateFields('scheduleHelp')}
          name="schedule"
          value={draft.schedule}
          error={errorFor('schedule')}
          onChange={(event) => change('schedule', event.target.value)}
        />

        <Input
          label={translateFields('municipalPermit')}
          help={translateFields('municipalPermitHelp')}
          name="municipalPermit"
          value={draft.municipalPermit}
          error={errorFor('municipalPermit')}
          onChange={(event) => change('municipalPermit', event.target.value)}
        />

        <Combobox
          label={translateFields('activity')}
          help={translateFields('activityHelp')}
          options={[
            { value: '', label: translateFields('activityInherited') },
            ...activities.map((activity) => ({ value: activity._id, label: activity.name })),
          ]}
          value={draft.activity}
          placeholder={translateFields('activityPlaceholder')}
          emptyMessage={translateFields('activityEmpty')}
          error={errorFor('activity')}
          onChange={(value) => change('activity', value)}
        />
      </div>
    </Modal>
  );
}
