import type { DateTime } from "owlelia";

export function isHoliday(date: DateTime, holidays: DateTime[]): boolean {
  return holidays.some((x) => x.equals(date));
}

export function isWeekday(date: DateTime): boolean {
  // noinspection OverlyComplexBooleanExpressionJS
  return (
    date.isMonday ||
    date.isTuesday ||
    date.isWednesday ||
    date.isThursday ||
    date.isFriday
  );
}

export function isWorkday(date: DateTime, holidays: DateTime[]): boolean {
  return isWeekday(date) && !isHoliday(date, holidays);
}

export function plusWorkdays(
  date: DateTime,
  days: number,
  holidays: DateTime[],
): DateTime {
  let d = date.clone();

  if (days > 0) {
    while (days > 0) {
      d = d.plusDays(1);
      if (isWorkday(d, holidays)) {
        days -= 1;
      }
    }
  } else {
    while (days < 0) {
      d = d.minusDays(1);
      if (isWorkday(d, holidays)) {
        days += 1;
      }
    }
  }

  return d;
}

export function reverseOffsetWorkdays(
  dst: DateTime,
  days: number,
  holidays: DateTime[],
): DateTime[] {
  if (!isWorkday(dst, holidays)) {
    return [];
  }

  let dates = [];
  let d = dst.clone();

  if (days > 0) {
    while (days > 0 || !isWorkday(d, holidays)) {
      if (isWorkday(d, holidays)) {
        days -= 1;
      }
      d = d.minusDays(1);
      if (days === 0) {
        dates.push(d);
      }
    }
  } else {
    while (days < 0 || !isWorkday(d, holidays)) {
      if (isWorkday(d, holidays)) {
        days += 1;
      }
      d = d.plusDays(1);
      if (days === 0) {
        dates.push(d);
      }
    }
  }

  return dates;
}
