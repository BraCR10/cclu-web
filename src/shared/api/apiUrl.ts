const configuredBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? '';

export function buildApiUrl(path: string, baseUrl: string = configuredBaseUrl): string {
  const baseWithoutTrailingSlash = baseUrl.replace(/\/+$/, '');
  const pathWithLeadingSlash = path.startsWith('/') ? path : `/${path}`;

  return `${baseWithoutTrailingSlash}${pathWithLeadingSlash}`;
}
