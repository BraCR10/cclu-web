// The form asks for one requirement per line or separated by periods, so the
// job board reads them back as a list either way.
export function requirementList(requirements: string | null): string[] {
  if (requirements === null) {
    return [];
  }

  return (
    requirements
      // A period ends a requirement only when a new sentence starts after it, so
      // "1:00 p. m." stays whole.
      .split(/\n|\.(?=\s+[A-ZÁÉÍÓÚÑ¿¡]|\s*$)/)
      .map((requirement) => requirement.trim())
      .filter((requirement) => requirement !== '')
  );
}
