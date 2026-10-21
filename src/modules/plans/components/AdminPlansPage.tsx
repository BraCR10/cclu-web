'use client';

import { useTranslations } from 'next-intl';
import { Alert } from '@/shared/components/Alert';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Input } from '@/shared/components/Input';
import { StickyActionBar } from '@/shared/components/StickyActionBar';
import { formatColones } from '@/shared/utils/formatColones';
import { parseFeeInput } from '../feeForm';
import { useFeeEditor } from '../hooks/useFeeEditor';
import { FeeHistory } from './FeeHistory';
import { NoticeSettings } from './NoticeSettings';
import { PlanBadge } from '@/shared/components/PlanBadge';

export function AdminPlansPage() {
  const translate = useTranslations('admin.plans');
  const translateErrors = useTranslations('errors');
  const editor = useFeeEditor();

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:gap-8 lg:px-8 lg:py-8">
      <Alert
        tone="info"
        title={translate('appliesFrom.title')}
        message={translate('appliesFrom.message')}
      />

      {editor.failed && <Alert tone="danger" title={translateErrors('network_error')} />}

      {editor.plans !== null && (
        <form
          className="flex flex-col gap-6"
          onSubmit={(event) => {
            event.preventDefault();
            void editor.save();
          }}
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {editor.plans.map((plan) => {
              const isFree = plan.key === 'free';
              const draft = editor.drafts[plan.key];

              return (
                <Card key={plan.key} className="flex flex-col gap-3">
                  <PlanBadge planKey={plan.key} name={plan.name} />
                  <Input
                    label={translate('monthlyFee')}
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={12}
                    readOnly={isFree}
                    value={draft === null || draft === undefined ? '' : formatColones(draft)}
                    help={isFree ? translate('alwaysFree') : undefined}
                    error={editor.errorFor(plan.key)}
                    onChange={(event) => editor.change(plan.key, parseFeeInput(event.target.value))}
                  />
                </Card>
              );
            })}
          </div>

          <StickyActionBar>
            <div className="flex gap-3 lg:justify-end">
              <Button
                variant="secondary"
                className="flex-1 lg:flex-none"
                disabled={!editor.hasChanges || editor.saving}
                onClick={editor.discard}
              >
                {translate('discard')}
              </Button>
              <Button
                type="submit"
                className="flex-1 lg:flex-none"
                disabled={!editor.hasChanges}
                loading={editor.saving}
              >
                {translate('save')}
              </Button>
            </div>
          </StickyActionBar>
        </form>
      )}

      <NoticeSettings />

      {editor.history !== null && (
        <FeeHistory history={editor.history} onPageChange={editor.showHistoryPage} />
      )}
    </div>
  );
}
