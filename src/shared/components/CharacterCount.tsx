import { FIELDS } from '@/shared/config/memberRules';

// A control that simply stops accepting keystrokes tells nobody why. Where the
// limit is reachable, the count is the honest way to state it: the rule behind
// the alert mark only appears once something was refused, and a control the
// browser caps can never refuse anything.
export function CharacterCount({ field, value }: { field: string; value: string }) {
  const limit = FIELDS[field]?.maxLength;

  if (limit === undefined) {
    return null;
  }

  const remaining = limit - value.length;

  return (
    <p className={`text-xs ${remaining < 20 ? 'text-danger' : 'text-content-muted'}`}>
      {value.length} de {limit} caracteres
    </p>
  );
}
