import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = join(import.meta.dirname, '..', '..');
const SCANNED = ['src', 'tests'];
const SKIPPED = new Set(['node_modules', '.git', '.next', 'coverage']);
const EXTENSIONS = ['.ts', '.tsx', '.css', '.mts'];

// Function words that carry no meaning in English, so finding one in a comment
// means the comment is not in English. Proper nouns the chamber uses, such as
// La Unión or cantón, contain none of them and are left alone. What a person
// reads on screen stays Spanish and lives in strings, never in comments.
const SPANISH_MARKERS = [
  'que',
  'para',
  'los',
  'las',
  'con',
  'por',
  'una',
  'del',
  'cuando',
  'donde',
  'desde',
  'entre',
  'sobre',
  'pero',
  'como',
  'este',
  'esta',
  'cada',
  'debe',
  'hace',
];

const COMMENT = /^\s*(\/\/|\*|\/\*|\{\s*\/\*)/;
const SELF = relative(ROOT, import.meta.filename);

function filesUnder(entry: string): string[] {
  const found: string[] = [];

  const walk = (current: string) => {
    if (statSync(current).isFile()) {
      if (EXTENSIONS.some((extension) => current.endsWith(extension))) {
        found.push(current);
      }

      return;
    }

    for (const name of readdirSync(current)) {
      if (!SKIPPED.has(name)) {
        walk(join(current, name));
      }
    }
  };

  walk(join(ROOT, entry));

  return found;
}

function spanishCommentsIn(file: string): string[] {
  const pattern = new RegExp(`\\b(${SPANISH_MARKERS.join('|')})\\b`, 'i');

  return readFileSync(file, 'utf8')
    .split('\n')
    .map((line, index) => ({ line, number: index + 1 }))
    .filter(({ line }) => COMMENT.test(line) && pattern.test(line))
    .map(({ line, number }) => `${relative(ROOT, file)}:${number} ${line.trim()}`);
}

describe('comment language', () => {
  it('keeps every comment in English', () => {
    const offenders = SCANNED.flatMap(filesUnder)
      .filter((file) => relative(ROOT, file) !== SELF)
      .flatMap(spanishCommentsIn);

    expect(offenders).toEqual([]);
  });
});
