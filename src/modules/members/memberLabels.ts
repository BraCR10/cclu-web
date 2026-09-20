import { MEMBER_STATES, type MemberState } from './api/profile';

// One sentence per state, because the two fields behind it are the chamber's
// business and not something a member should have to reconcile.
export const MEMBER_STATE_LABELS: Record<MemberState, { label: string; detail: string }> = {
  [MEMBER_STATES.ACTIVE]: {
    label: 'Afiliación activa',
    detail: 'Su afiliación está al día.',
  },
  [MEMBER_STATES.UNDER_REVIEW]: {
    label: 'En revisión',
    detail: 'La Cámara todavía está revisando su solicitud.',
  },
  [MEMBER_STATES.SUSPENDED]: {
    label: 'Afiliación suspendida',
    detail: 'Comuníquese con la Cámara para restablecerla.',
  },
  [MEMBER_STATES.REJECTED]: {
    label: 'Solicitud rechazada',
    detail: 'Su solicitud de afiliación no fue aceptada.',
  },
};

export const MEMBER_STATE_TONE: Record<MemberState, string> = {
  [MEMBER_STATES.ACTIVE]: 'bg-support text-on-support',
  [MEMBER_STATES.UNDER_REVIEW]: 'border border-border text-content-muted',
  [MEMBER_STATES.SUSPENDED]: 'bg-highlight text-on-highlight',
  [MEMBER_STATES.REJECTED]: 'bg-highlight text-on-highlight',
};
