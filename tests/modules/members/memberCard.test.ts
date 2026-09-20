import { describe, it, expect } from 'vitest';
import { directoryPathFor, directoryUrlFor, renderQrCode } from '@/modules/members/memberCard';

describe('directoryPathFor', () => {
  // A card shows the code grouped for reading aloud, but the address carries it
  // ungrouped, so the same affiliate never has two addresses.
  it('strips the grouping a person reads', () => {
    expect(directoryPathFor('M-A7K2-Q4')).toBe('/directory/MA7K2Q4');
    expect(directoryPathFor('MA7K2Q4')).toBe('/directory/MA7K2Q4');
  });
});

describe('directoryUrlFor', () => {
  it('builds an absolute address, because a camera reads it elsewhere', () => {
    expect(directoryUrlFor('MA7K2Q4', 'https://cclu.cr')).toBe('https://cclu.cr/directory/MA7K2Q4');
  });

  it('does not double the slash when the origin carries one', () => {
    expect(directoryUrlFor('MA7K2Q4', 'https://cclu.cr/')).toBe(
      'https://cclu.cr/directory/MA7K2Q4',
    );
  });
});

describe('renderQrCode', () => {
  it('draws a vector, so the card stays sharp printed or enlarged', async () => {
    const svg = await renderQrCode('https://cclu.cr/directory/MA7K2Q4');

    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('viewBox');
  });

  // What the camera reads has to be the address and nothing else, so a change
  // of address must change the pattern.
  it('draws a different pattern for a different address', async () => {
    const [first, second] = await Promise.all([
      renderQrCode('https://cclu.cr/directory/MA7K2Q4'),
      renderQrCode('https://cclu.cr/directory/MB3N5R8'),
    ]);

    expect(first).not.toBe(second);
  });

  it('draws the same pattern for the same address', async () => {
    const [first, second] = await Promise.all([
      renderQrCode('https://cclu.cr/directory/MA7K2Q4'),
      renderQrCode('https://cclu.cr/directory/MA7K2Q4'),
    ]);

    expect(first).toBe(second);
  });
});
