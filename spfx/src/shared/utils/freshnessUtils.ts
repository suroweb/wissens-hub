export type FreshnessLevel = 'green' | 'yellow' | 'red';

export function getFreshnessLevel(lastUpdated: Date): FreshnessLevel {
  const now = Date.now();
  const daysSince = Math.floor((now - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
  if (daysSince < 30) return 'green';
  if (daysSince <= 90) return 'yellow';
  return 'red';
}

export function getFreshnessLabel(lastUpdated: Date): string {
  const now = Date.now();
  const daysSince = Math.floor((now - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
  if (daysSince < 30) return 'Aktuell (' + daysSince + ' Tage)';
  if (daysSince <= 90) return 'Alternd (' + daysSince + ' Tage)';
  return 'Veraltet (' + daysSince + ' Tage)';
}

export function getFreshnessColor(level: FreshnessLevel): string {
  if (level === 'green') return '#107c10';
  if (level === 'yellow') return '#ca5010';
  return '#d13438';
}
