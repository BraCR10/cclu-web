'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Alert } from '@/shared/components/Alert';
import { Button } from '@/shared/components/Button';
import { Combobox } from '@/shared/components/Combobox';
import { FileField } from '@/shared/components/FileField';
import { Input } from '@/shared/components/Input';
import { Modal } from '@/shared/components/Modal';
import { Select } from '@/shared/components/Select';
import { Textarea } from '@/shared/components/Textarea';
import { useIsDesktop } from '@/shared/hooks/useMediaQuery';
import type { CatalogActivity, CatalogCanton } from '../api/registration';
import { uploadFile } from '../api/registration';
import type { MemberProfile, ProfileChanges } from '../api/profile';
import type { SaveOutcome } from '../hooks/useMemberProfile';

export type ProfileSection = 'business' | 'contact' | 'legal';

type ProfileModalProps = {
  section: ProfileSection;
  profile: MemberProfile;
  cantons: CatalogCanton[];
  activities: CatalogActivity[];
  saving: boolean;
  onSave: (changes: ProfileChanges) => Promise<SaveOutcome>;
  onClose: () => void;
};

// The activity a member types themselves, which travels as a name rather than as
// a reference. Same value the registration uses.
const OTHER_ACTIVITY = 'other';

function text(value: string | null | undefined): string {
  return value ?? '';
}

function draftFor(section: ProfileSection, profile: MemberProfile): Record<string, string> {
  if (section === 'business') {
    return {
      businessName: text(profile.businessName),
      managerName: text(profile.managerName),
      businessDescription: text(profile.businessDescription),
      activity: text(profile.activity?._id),
      activityOther: text(profile.activityOther),
      branchName: text(profile.branchName),
      canton: text(profile.canton?._id),
      district: text(profile.district),
      institutionalPhone: text(profile.institutionalPhone),
      location: text(profile.location),
    };
  }

  if (section === 'contact') {
    return {
      phone: text(profile.phone),
      whatsappNumber: text(profile.whatsappNumber),
      billingEmail: text(profile.billingEmail),
      website: text(profile.website),
      instagram: text(profile.instagram),
      facebook: text(profile.facebook),
      linkedin: text(profile.linkedin),
    };
  }

  return {
    legalName: text(profile.legalName),
    legalRepresentativeName: text(profile.legalRepresentativeName),
    legalRepresentativeIdentification: text(profile.legalRepresentativeIdentification),
    certificationIssuedAt: text(profile.certificationIssuedAt?.slice(0, 10)),
  };
}

// One popup per section, because each one edits what it shows and nothing else:
// the body carries that section's fields, so a popup that never showed the
// address cannot overwrite it.
export function ProfileModal({
  section,
  profile,
  cantons,
  activities,
  saving,
  onSave,
  onClose,
}: ProfileModalProps) {
  const translate = useTranslations('member.profile');
  const translateFields = useTranslations('member.profile.fields');
  const canDrag = useIsDesktop();

  const [draft, setDraft] = useState<Record<string, string>>(() => draftFor(section, profile));
  const [certificationFileKey, setCertificationFileKey] = useState(
    text(profile.certificationFileKey),
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | undefined>(undefined);
  const [error, setError] = useState<{ message: string; field?: string } | null>(null);
  const [province, setProvince] = useState(profile.canton?.province ?? '');

  const provinces = [...new Set(cantons.map((canton) => canton.province))].sort();
  const visibleCantons =
    province === '' ? cantons : cantons.filter((canton) => canton.province === province);

  const change = (field: string, value: string) =>
    setDraft((current) => ({ ...current, [field]: value }));

  const errorFor = (field: string) => (error?.field === field ? error.message : undefined);

  async function selectCertification(file: File) {
    setUploading(true);
    setUploadError(undefined);

    try {
      const { key } = await uploadFile({
        file,
        purpose: 'membership-certifications',
        // The member exists, so their own identifier is the owner the file
        // belongs to.
        ownerId: profile._id,
      });

      setCertificationFileKey(key);
    } catch {
      setUploadError(translate('legal.uploadFailed'));
    } finally {
      setUploading(false);
    }
  }

  async function submit() {
    setError(null);

    const changes: ProfileChanges =
      section === 'legal' ? { ...draft, certificationFileKey } : { ...draft };

    // An activity chosen from the catalog clears the one written out, which is
    // what the API does with the pair.
    if (section === 'business' && draft.activity !== '' && draft.activity !== OTHER_ACTIVITY) {
      delete changes.activityOther;
    }

    const outcome = await onSave(changes);

    if (outcome.ok) {
      onClose();
    } else {
      setError(outcome);
    }
  }

  return (
    <Modal
      open
      title={translate(`${section}.title`)}
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
        {error !== null && error.field === undefined && (
          <Alert tone="danger" title={error.message} />
        )}

        {section === 'business' && (
          <>
            <Input
              label={translateFields('businessName')}
              name="businessName"
              value={draft.businessName}
              error={errorFor('businessName')}
              onChange={(event) => change('businessName', event.target.value)}
            />
            <Input
              label={translateFields('managerName')}
              name="managerName"
              value={draft.managerName}
              error={errorFor('managerName')}
              onChange={(event) => change('managerName', event.target.value)}
            />
            <Textarea
              label={translateFields('businessDescription')}
              name="businessDescription"
              value={draft.businessDescription}
              error={errorFor('businessDescription')}
              maxLength={500}
              onChange={(event) => change('businessDescription', event.target.value)}
            />
            <Combobox
              label={translateFields('activity')}
              options={[
                ...activities.map((activity) => ({ value: activity._id, label: activity.name })),
                { value: OTHER_ACTIVITY, label: translateFields('activityOtherOption') },
              ]}
              value={draft.activity}
              placeholder={translateFields('activityPlaceholder')}
              emptyMessage={translateFields('activityEmpty')}
              error={errorFor('activity')}
              onChange={(value) => change('activity', value)}
            />

            {(draft.activity === '' || draft.activity === OTHER_ACTIVITY) && (
              <Input
                label={translateFields('activityOther')}
                name="activityOther"
                value={draft.activityOther}
                error={errorFor('activityOther')}
                onChange={(event) => change('activityOther', event.target.value)}
              />
            )}

            <Input
              label={translateFields('branchName')}
              name="branchName"
              value={draft.branchName}
              error={errorFor('branchName')}
              onChange={(event) => change('branchName', event.target.value)}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <Select
                label={translateFields('province')}
                name="province"
                value={province}
                placeholder={translateFields('province')}
                onChange={(event) => setProvince(event.target.value)}
                options={provinces.map((name) => ({ value: name, label: name }))}
              />
              <Select
                label={translateFields('canton')}
                name="canton"
                value={draft.canton}
                error={errorFor('canton')}
                placeholder={translateFields('canton')}
                onChange={(event) => change('canton', event.target.value)}
                options={visibleCantons.map((canton) => ({
                  value: canton._id,
                  label: canton.name,
                }))}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label={translateFields('district')}
                name="district"
                value={draft.district}
                error={errorFor('district')}
                onChange={(event) => change('district', event.target.value)}
              />
              <Input
                label={translateFields('institutionalPhone')}
                name="institutionalPhone"
                type="tel"
                value={draft.institutionalPhone}
                error={errorFor('institutionalPhone')}
                onChange={(event) => change('institutionalPhone', event.target.value)}
              />
            </div>

            <Input
              label={translateFields('location')}
              name="location"
              value={draft.location}
              error={errorFor('location')}
              onChange={(event) => change('location', event.target.value)}
            />
          </>
        )}

        {section === 'contact' && (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label={translateFields('phone')}
                name="phone"
                type="tel"
                value={draft.phone}
                error={errorFor('phone')}
                onChange={(event) => change('phone', event.target.value)}
              />
              <Input
                label={translateFields('whatsapp')}
                name="whatsappNumber"
                type="tel"
                value={draft.whatsappNumber}
                error={errorFor('whatsappNumber')}
                onChange={(event) => change('whatsappNumber', event.target.value)}
              />
            </div>

            <Input
              label={translateFields('billingEmail')}
              name="billingEmail"
              type="email"
              value={draft.billingEmail}
              error={errorFor('billingEmail')}
              onChange={(event) => change('billingEmail', event.target.value)}
            />
            <Input
              label={translateFields('website')}
              name="website"
              value={draft.website}
              error={errorFor('website')}
              onChange={(event) => change('website', event.target.value)}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label={translateFields('instagram')}
                name="instagram"
                value={draft.instagram}
                error={errorFor('instagram')}
                onChange={(event) => change('instagram', event.target.value)}
              />
              <Input
                label={translateFields('facebook')}
                name="facebook"
                value={draft.facebook}
                error={errorFor('facebook')}
                onChange={(event) => change('facebook', event.target.value)}
              />
            </div>

            <Input
              label={translateFields('linkedin')}
              name="linkedin"
              value={draft.linkedin}
              error={errorFor('linkedin')}
              onChange={(event) => change('linkedin', event.target.value)}
            />
          </>
        )}

        {section === 'legal' && (
          <>
            <Input
              label={translateFields('legalName')}
              name="legalName"
              value={draft.legalName}
              error={errorFor('legalName')}
              onChange={(event) => change('legalName', event.target.value)}
            />
            <Input
              label={translateFields('legalRepresentativeName')}
              name="legalRepresentativeName"
              value={draft.legalRepresentativeName}
              error={errorFor('legalRepresentativeName')}
              onChange={(event) => change('legalRepresentativeName', event.target.value)}
            />
            <Input
              label={translateFields('legalRepresentativeIdentification')}
              name="legalRepresentativeIdentification"
              value={draft.legalRepresentativeIdentification}
              error={errorFor('legalRepresentativeIdentification')}
              onChange={(event) => change('legalRepresentativeIdentification', event.target.value)}
            />

            <FileField
              label={translate('legal.certification')}
              hint={
                canDrag
                  ? translate('legal.certificationHint')
                  : translate('legal.certificationHintMobile')
              }
              acceptedFormats={translate('legal.certificationFormats')}
              accept="application/pdf,image/jpeg,image/png"
              status={uploading ? 'uploading' : certificationFileKey === '' ? 'empty' : 'stored'}
              error={uploadError}
              onSelect={(file) => void selectCertification(file)}
              onRemove={() => setCertificationFileKey('')}
            />

            <Input
              label={translateFields('certificationIssuedAt')}
              name="certificationIssuedAt"
              type="date"
              value={draft.certificationIssuedAt}
              error={errorFor('certificationIssuedAt')}
              onChange={(event) => change('certificationIssuedAt', event.target.value)}
            />
          </>
        )}
      </div>
    </Modal>
  );
}
