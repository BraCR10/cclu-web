import { describe, expect, it } from 'vitest';
import { requirementList } from '@/modules/jobs/requirementList';

describe('requirementList', () => {
  it('reads one requirement per line', () => {
    expect(requirementList('Secundaria completa\nLicencia B1')).toEqual([
      'Secundaria completa',
      'Licencia B1',
    ]);
  });

  it('reads requirements separated by periods, keeping a time such as 1:00 p. m. whole', () => {
    expect(
      requirementList(
        'Experiencia de 6 meses. Disponibilidad de 1:00 p. m. a 6:00 p. m. Licencia B1.',
      ),
    ).toEqual([
      'Experiencia de 6 meses',
      'Disponibilidad de 1:00 p. m. a 6:00 p. m',
      'Licencia B1',
    ]);
  });

  it('has nothing to list when there are no requirements', () => {
    expect(requirementList(null)).toEqual([]);
  });
});
