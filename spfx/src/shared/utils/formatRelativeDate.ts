/**
 * German locale relative date formatting.
 * Produces strings like "vor 2 Tagen", "gestern", "vor 3 Stunden".
 * Uses manual German strings since Intl.RelativeTimeFormat is not available in ES5 target.
 */

export function formatRelativeDate(date: Date): string {
  const now = Date.now();
  const diffMs = now - date.getTime();
  const absDiffMs = Math.abs(diffMs);

  const seconds = Math.round(absDiffMs / 1000);
  const minutes = Math.round(absDiffMs / (1000 * 60));
  const hours = Math.round(absDiffMs / (1000 * 60 * 60));
  const days = Math.round(absDiffMs / (1000 * 60 * 60 * 24));
  const months = Math.round(absDiffMs / (1000 * 60 * 60 * 24 * 30));

  // Past dates (diffMs > 0 means date is in the past)
  if (diffMs >= 0) {
    if (months >= 1) {
      return months === 1 ? 'vor 1 Monat' : `vor ${months} Monaten`;
    }
    if (days >= 2) {
      return `vor ${days} Tagen`;
    }
    if (days === 1) {
      return 'gestern';
    }
    if (hours >= 1) {
      return hours === 1 ? 'vor 1 Stunde' : `vor ${hours} Stunden`;
    }
    if (minutes >= 1) {
      return minutes === 1 ? 'vor 1 Minute' : `vor ${minutes} Minuten`;
    }
    return seconds <= 1 ? 'gerade eben' : `vor ${seconds} Sekunden`;
  }

  // Future dates (rare but handled)
  if (months >= 1) {
    return months === 1 ? 'in 1 Monat' : `in ${months} Monaten`;
  }
  if (days >= 2) {
    return `in ${days} Tagen`;
  }
  if (days === 1) {
    return 'morgen';
  }
  if (hours >= 1) {
    return hours === 1 ? 'in 1 Stunde' : `in ${hours} Stunden`;
  }
  if (minutes >= 1) {
    return minutes === 1 ? 'in 1 Minute' : `in ${minutes} Minuten`;
  }
  return seconds <= 1 ? 'gerade eben' : `in ${seconds} Sekunden`;
}
