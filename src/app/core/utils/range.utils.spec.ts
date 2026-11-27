import { emptyRange } from '../models';
import { isDateInRange, isInRange } from './range.utils';

describe('isInRange', () => {
  it('should accept anything when the range is empty', () => {
    expect(isInRange(42, emptyRange())).toBe(true);
  });

  it('should include both limits', () => {
    const range = { from: 10, to: 20 };

    expect(isInRange(10, range)).toBe(true);
    expect(isInRange(20, range)).toBe(true);
    expect(isInRange(9, range)).toBe(false);
    expect(isInRange(21, range)).toBe(false);
  });

  it('should use zero as a real limit', () => {
    expect(isInRange(-1, { from: 0, to: null })).toBe(false);
  });
});

describe('isDateInRange', () => {
  // The datepicker returns dates at midnight, but batches have a time of day.
  const range = { from: new Date(2026, 0, 10), to: new Date(2026, 0, 10) };

  it('should include the whole last day of the range', () => {
    expect(isDateInRange(new Date(2026, 0, 10, 23, 59), range)).toBe(true);
  });

  it('should exclude the days outside the range', () => {
    expect(isDateInRange(new Date(2026, 0, 9, 23, 59), range)).toBe(false);
    expect(isDateInRange(new Date(2026, 0, 11, 0, 0), range)).toBe(false);
  });
});
