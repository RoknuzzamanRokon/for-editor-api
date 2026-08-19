/** The API sends naive UTC timestamps (no "Z"/offset suffix). Without a zone
 *  marker, `new Date()` parses a date-time string as local time, so every
 *  reading silently drifts by the viewer's UTC offset — e.g. every timestamp
 *  reads exactly "6h ago" for a viewer at UTC+6. Treat a zone-less string as UTC. */
export function parseServerTimestamp(value: string): number {
  const hasTimezone = /Z$|[+-]\d{2}:?\d{2}$/.test(value);
  return new Date(hasTimezone ? value : `${value}Z`).getTime();
}

export function formatRelativeTime(value: string): string {
  const then = parseServerTimestamp(value);
  if (Number.isNaN(then)) return "";

  const seconds = Math.floor((Date.now() - then) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(then).toLocaleDateString();
}
