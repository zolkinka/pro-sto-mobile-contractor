export function readServiceCenterUuid(token: string | null | undefined): string | null {
  if (!token) {
    return null;
  }

  const part = token.split('.')[1];
  if (!part) {
    return null;
  }

  try {
    const normalized = part.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
    const payload = JSON.parse(global.atob(padded)) as { serviceCenterUuid?: unknown };
    return typeof payload.serviceCenterUuid === 'string' && payload.serviceCenterUuid
      ? payload.serviceCenterUuid
      : null;
  } catch {
    return null;
  }
}
