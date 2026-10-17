'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Input } from '@/shared/components/Input';
import { useNoticeEditor } from '../hooks/useNoticeEditor';

// One value for the reminder mailed to the member and the count of plans
// expiring soon in the panel, so the two never disagree.
export function NoticeSettings() {
  const translate = useTranslations('admin.plans.notice');
  const editor = useNoticeEditor();

  if (editor.policy === null) {
    return null;
  }

  return (
    <Card as="section" aria-labelledby="expiry-notice" className="flex flex-col gap-4">
      <h2 id="expiry-notice" className="font-display text-heading-m text-fg">
        {translate('title')}
      </h2>
      <form
        className="flex flex-col gap-3 lg:flex-row lg:items-start lg:gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void editor.save();
        }}
      >
        <div className="lg:w-80">
          <Input
            label={translate('days')}
            inputMode="numeric"
            autoComplete="off"
            maxLength={2}
            value={editor.draft}
            help={translate('help', {
              minimum: editor.policy.minimum,
              maximum: editor.policy.maximum,
            })}
            error={editor.error}
            onChange={(event) => editor.change(event.target.value)}
          />
        </div>
        <Button
          type="submit"
          className="lg:mt-7"
          disabled={!editor.hasChange}
          loading={editor.saving}
        >
          {translate('save')}
        </Button>
      </form>
    </Card>
  );
}
