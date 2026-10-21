import { describe, expect, it } from 'vitest';
import { missingFields } from '@/modules/jobs/hooks/useVacancyForm';

const COMPLETE = {
  title: 'Barista medio tiempo',
  description: 'Preparás bebidas de café.',
  requirements: '',
  workday: 'part_time' as const,
  howToApply: 'WhatsApp 8845 1290',
  branch: '6aaf7c6235d3cb4fef0931aa',
};

describe('missingFields', () => {
  it('lets a vacancy without requirements through, since they are optional', () => {
    expect(missingFields(COMPLETE)).toEqual([]);
  });

  it('names every required field left empty or blank', () => {
    expect(missingFields({ ...COMPLETE, title: '  ', workday: '', branch: '' })).toEqual([
      'title',
      'workday',
      'branch',
    ]);
  });
});
