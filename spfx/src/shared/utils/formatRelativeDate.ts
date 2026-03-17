/**
 * Localized relative date formatting.
 * Uses SharedStrings loc module for German/English strings.
 * Falls back to German strings if SharedStrings is not loaded.
 */
import * as sharedStrings from 'SharedStrings';

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
      return months === 1 ? sharedStrings.OneMonthAgo : sharedStrings.MonthsAgo.replace('{0}', '' + months);
    }
    if (days >= 2) {
      return sharedStrings.DaysAgo.replace('{0}', '' + days);
    }
    if (days === 1) {
      return sharedStrings.Yesterday;
    }
    if (hours >= 1) {
      return hours === 1 ? sharedStrings.OneHourAgo : sharedStrings.HoursAgo.replace('{0}', '' + hours);
    }
    if (minutes >= 1) {
      return minutes === 1 ? sharedStrings.OneMinuteAgo : sharedStrings.MinutesAgo.replace('{0}', '' + minutes);
    }
    return seconds <= 1 ? sharedStrings.JustNow : sharedStrings.SecondsAgo.replace('{0}', '' + seconds);
  }

  // Future dates (rare but handled)
  if (months >= 1) {
    return months === 1 ? sharedStrings.InOneMonth : sharedStrings.InMonths.replace('{0}', '' + months);
  }
  if (days >= 2) {
    return sharedStrings.InDays.replace('{0}', '' + days);
  }
  if (days === 1) {
    return sharedStrings.Tomorrow;
  }
  if (hours >= 1) {
    return hours === 1 ? sharedStrings.InOneHour : sharedStrings.InHours.replace('{0}', '' + hours);
  }
  if (minutes >= 1) {
    return minutes === 1 ? sharedStrings.InOneMinute : sharedStrings.InMinutes.replace('{0}', '' + minutes);
  }
  return seconds <= 1 ? sharedStrings.JustNow : sharedStrings.InSeconds.replace('{0}', '' + seconds);
}
