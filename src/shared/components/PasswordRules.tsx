import { Check, Circle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { classNames } from '@/shared/utils/classNames';
import { PASSWORD_RULE_IDS, isRuleMet } from '@/shared/validation/password';

// Drawn under the password fields: the four things the API asks for, one line
// each, so a person is told before they send anything rather than after.
export function PasswordRules({ password }: { password: string }) {
  const translate = useTranslations('common.passwordRules');

  return (
    <ul className="mt-2 flex flex-col gap-1">
      {PASSWORD_RULE_IDS.map((rule) => {
        const met = isRuleMet(rule, password);

        return (
          <li key={rule} className="flex items-center gap-2">
            {met ? (
              <Check aria-hidden="true" className="h-4 w-4 shrink-0 text-success" />
            ) : (
              <Circle aria-hidden="true" className="h-4 w-4 shrink-0 text-fg-muted" />
            )}
            <span className={classNames('text-body-s', met ? 'text-success' : 'text-fg-muted')}>
              {translate(rule)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
