// One reading of an own publication's state, shared by the promotion and
// discount panels: what to call it, and which actions still make sense.
type OwnPublicationState = {
  isActive: boolean;
  adminStatus: 'active' | 'inactive' | 'blocked';
  expired: boolean;
};

export function describeOwnPublication(publication: OwnPublicationState): {
  label: string;
  blocked: boolean;
  canReactivate: boolean;
  canClose: boolean;
} {
  const blocked = publication.adminStatus === 'blocked';

  const label = blocked
    ? 'Bloqueada permanentemente'
    : publication.adminStatus === 'inactive'
      ? 'Inactivada por la Cámara'
      : !publication.isActive
        ? 'Retirada'
        : publication.expired
          ? 'Vencida'
          : 'Activa';

  return {
    label,
    blocked,
    canReactivate: !blocked && (!publication.isActive || publication.expired),
    canClose: !blocked && publication.isActive,
  };
}
