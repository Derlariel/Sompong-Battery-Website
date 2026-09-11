const DAY = 24 * 60 * 60 * 1000;
const BANGKOK_OFFSET = 7 * 60 * 60 * 1000;

export function visitPeriods(now = new Date()) {
  const bangkok = new Date(now.getTime() + BANGKOK_OFFSET);
  const year = bangkok.getUTCFullYear();
  const month = bangkok.getUTCMonth();
  const today = new Date(Date.UTC(year, month, bangkok.getUTCDate()) - BANGKOK_OFFSET);
  const week = new Date(today.getTime() - ((bangkok.getUTCDay() + 6) % 7) * DAY);
  const monthStart = new Date(Date.UTC(year, month, 1) - BANGKOK_OFFSET);
  return { today, week, month: monthStart };
}
