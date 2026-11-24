import { Range } from '../models';

export function isInRange(value: number, range: Range<number>): boolean {
  if (range.from !== null && value < range.from) return false;
  if (range.to !== null && value > range.to) return false;
  return true;
}

export function isDateInRange(value: Date, range: Range<Date>): boolean {
  const time = value.getTime();
  if (range.from !== null && time < startOfDay(range.from).getTime()) return false;
  if (range.to !== null && time > endOfDay(range.to).getTime()) return false;
  return true;
}

/**
 * since the datepicker returns a date with the time set to 00:00:00, we need to set the time to the end of the day to include all entries of that day in the range.
 */
function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}