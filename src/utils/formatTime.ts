export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  let dayLabel: string;
  if (isSameDay(date, now)) {
    dayLabel = "Today";
  } else if (isSameDay(date, yesterday)) {
    dayLabel = "Yesterday";
  } else {
    dayLabel = date.toLocaleDateString();
  }

  const time = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return `${dayLabel} ${time}`;
}

/** Formats a duration given in milliseconds as "Xh Ym" (or just "Ym" under an hour). */
export function formatDurationMs(ms: number): string {
  const sec = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

/** Formats a date as a 24-hour clock time, e.g. "10:49" — used for OSRS-style chat timestamps. */
export function formatClockTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
