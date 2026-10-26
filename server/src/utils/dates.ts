const IST_OFFSET_MS = 330 * 60 * 1000;

export function startOfIstDay(now = new Date()): Date {
  const ist = new Date(now.getTime() + IST_OFFSET_MS);
  ist.setUTCHours(0, 0, 0, 0);
  return new Date(ist.getTime() - IST_OFFSET_MS);
}

export function rangeStart(range: 'today' | 'yesterday' | 'week' | 'month', now = new Date()): { from: Date; to?: Date } {
  const today = startOfIstDay(now);
  const day = 24 * 3600 * 1000;
  switch (range) {
    case 'today': return { from: today };
    case 'yesterday': return { from: new Date(today.getTime() - day), to: today };
    case 'week': return { from: new Date(today.getTime() - 6 * day) };
    case 'month': return { from: new Date(today.getTime() - 29 * day) };
  }
}
