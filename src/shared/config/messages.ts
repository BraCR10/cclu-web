import { ApiError } from '@/shared/api/request';
import { FIELDS, PASSWORD, PATTERNS, type PatternName } from './memberRules';

// Everything the person reads when something is refused, said once. The screen
// reads a code and never the API's English text, so a change of wording on
// either side does not break the other.
export const MESSAGES: Record<string, string> = {
  // A field the form or the API judged.
  required: 'Este dato es obligatorio.',
  not_text: 'Este dato no tiene un formato válido.',
  too_long: 'Este dato es más largo de lo permitido.',
  invalid_format: 'Revise el formato de este dato.',
  not_allowed: 'Seleccione una de las opciones disponibles.',
  unknown_reference: 'La opción seleccionada ya no existe. Recargue la página.',
  nothing_to_change: 'No hay cambios que guardar.',
  body_missing: 'No se recibió información.',
  confirmation_mismatch: 'Las contraseñas no coinciden.',

  // Passwords.
  password_too_short: `La contraseña debe tener al menos ${PASSWORD.minimumLength} caracteres.`,
  password_too_long: 'La contraseña es más larga de lo que el sistema puede usar.',
  password_needs_letter: 'La contraseña debe incluir al menos una letra.',
  password_needs_digit: 'La contraseña debe incluir al menos un número.',
  password_needs_special: 'La contraseña debe incluir al menos un símbolo.',
  invalid_current_password: 'La contraseña actual no es correcta.',
  invalid_code: 'El código no es válido o ya venció. Solicite uno nuevo.',

  // Signing in. One answer for a wrong password and for an address that is not
  // an account: telling them apart would turn the form into a way of asking the
  // chamber who is affiliated with it.
  invalid_credentials: 'Correo o contraseña incorrectos.',
  application_pending:
    'Su solicitud de afiliación todavía está en revisión. Le escribiremos al correo que indicó cuando haya una respuesta.',
  application_rejected:
    'Su solicitud de afiliación fue rechazada. Revise el correo que le enviamos: incluye el motivo y un enlace para volver a enviarla.',
  account_suspended: 'Su cuenta está suspendida. Comuníquese con la Cámara para continuar.',
  already_registered:
    'No fue posible completar el registro. Comuníquese con la Cámara para continuar.',

  // Deciding on an application.
  already_decided: 'Otra persona ya decidió esta solicitud. La lista se actualizó.',
  gone: 'Esto ya no existe. La lista se actualizó.',
  not_allowed_role: 'Su sesión no tiene permiso para hacer esto.',

  // Anything else.
  too_many_attempts: 'Demasiados intentos. Espere unos minutos e intente de nuevo.',
  unavailable: 'No fue posible completar la acción. Intente de nuevo en unos momentos.',
  list_unavailable: 'No fue posible cargar la información.',
  sign_in_unavailable: 'No fue posible iniciar sesión. Intente de nuevo en unos momentos.',
  decision_unavailable: 'No fue posible completar la decisión. Intente de nuevo en unos momentos.',
  verification_unavailable:
    'No fue posible verificar el código. Intente de nuevo en unos momentos.',
  save_unavailable: 'No fue posible guardar. Intente de nuevo en unos momentos.',
  password_change_unavailable:
    'No fue posible completar el cambio. Intente de nuevo en unos momentos.',
  resubmission_unavailable:
    'No fue posible enviar la solicitud. Intente de nuevo en unos momentos.',
  registration_unavailable: 'No fue posible enviar el registro. Intente de nuevo en unos momentos.',

  // Only for a refusal that came back from the API after the form itself was
  // satisfied. A form never says this about its own fields: each one carries a
  // mark beside its label, and repeating it above says less than the marks do.
  form_incomplete: 'La Cámara no aceptó algunos datos. Revíselos e intente de nuevo.',
};

// What each refusal means when the API named no code of its own.
const BY_STATUS: Record<number, string> = {
  401: 'invalid_credentials',
  403: 'not_allowed_role',
  404: 'gone',
  409: 'already_decided',
  429: 'too_many_attempts',
};

export function messageForCode(code: string | undefined): string {
  return code === undefined ? MESSAGES.unavailable : (MESSAGES[code] ?? MESSAGES.unavailable);
}

type ErrorOptions = {
  // A screen that means something particular by a status says so, rather than
  // every screen repeating the same chain of conditions.
  byStatus?: Record<number, string>;
  fallback?: string;
};

// The one function every form calls. A refusal is read in this order: the code
// the API named, then the reason it gave, then what the status means here.
export function messageForError(error: unknown, options: ErrorOptions = {}): string {
  const fallback = options.fallback ?? MESSAGES.unavailable;

  if (!(error instanceof ApiError)) {
    return fallback;
  }

  if (error.code !== undefined && MESSAGES[error.code] !== undefined) {
    return MESSAGES[error.code];
  }

  if (error.reason !== undefined && MESSAGES[error.reason] !== undefined) {
    return MESSAGES[error.reason];
  }

  const code = options.byStatus?.[error.status] ?? BY_STATUS[error.status];

  return code === undefined ? fallback : (MESSAGES[code] ?? fallback);
}

// Both of these mean the list no longer matches the database, so a screen
// reloads instead of leaving a row that cannot be acted on.
export function leftListStale(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 409 || error.status === 404);
}

// What each rule asks for, said the way a person would say it. Keyed by the
// pattern it explains, so a pattern with no sentence here is a test failure
// rather than a field that refuses without ever saying why.
//
// coversLength is set where the sentence already states the length, so the
// field does not then repeat it as a second line.
const PATTERN_REQUIREMENTS: Record<PatternName, { text: string; coversLength: boolean }> = {
  email: { text: 'Debe tener la forma nombre@dominio.com', coversLength: false },
  phone: {
    text: 'Entre 8 y 20 caracteres. Solo números, espacios, paréntesis, el signo más y guiones.',
    coversLength: true,
  },
  identificationNumber: {
    text: 'Entre 6 y 20 caracteres. Solo letras, números y guiones.',
    coversLength: true,
  },
  handle: { text: 'Sin espacios.', coversLength: false },
  link: { text: 'Debe empezar con https:// o http://', coversLength: false },
};

// Everything a field asks of what is typed into it, as separate lines so the
// popup can list them and a screen reader can read them one by one.
export function describeField(field: string): string[] {
  const rule = FIELDS[field];

  if (rule === undefined) {
    return [];
  }

  const requirements: string[] = [];
  const pattern = rule.pattern === undefined ? undefined : PATTERN_REQUIREMENTS[rule.pattern];

  if (pattern !== undefined) {
    requirements.push(pattern.text);
  }

  if (pattern === undefined || !pattern.coversLength) {
    requirements.push(`Máximo ${rule.maxLength} caracteres.`);
  }

  return requirements;
}

export function describePassword(): string[] {
  return [
    `Al menos ${PASSWORD.minimumLength} caracteres.`,
    ...PASSWORD.requirements.map((requirement) => MESSAGES[requirement.code]),
  ];
}

export const PASSWORD_HINT = `Al menos ${PASSWORD.minimumLength} caracteres, con una letra, un número y un símbolo.`;

// A refusal that only says the format is wrong leaves the person guessing which
// part of it. Where the field has a rule that can be stated, the rule is the
// message.
export function messageForFieldCode(field: string, code: string): string {
  if (code !== 'invalid_format' && code !== 'too_long') {
    return messageForCode(code);
  }

  const requirements = describeField(field);

  return requirements.length === 0 ? messageForCode(code) : requirements.join(' ');
}

// Guards the pairing above: a pattern is only useful to a person once somebody
// has written down what it asks for.
export const EXPLAINED_PATTERNS = Object.keys(PATTERNS) as PatternName[];
