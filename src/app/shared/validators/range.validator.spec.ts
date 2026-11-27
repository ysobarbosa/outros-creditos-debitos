import { FormControl, FormGroup } from '@angular/forms';
import { INVALID_RANGE_ERROR, rangeValidator } from './range.validator';

function rangeGroup<T>(from: T | null, to: T | null): FormGroup {
  return new FormGroup(
    { from: new FormControl<T | null>(from), to: new FormControl<T | null>(to) },
    { validators: rangeValidator() },
  );
}

describe('rangeValidator', () => {
  it.each([
    ['both empty', null, null],
    ['only "from"', 10, null],
    ['only "to"', null, 10],
    ['from < to', 1, 10],
    ['from === to', 10, 10],
  ])('should accept %s', (_case, from, to) => {
    expect(rangeGroup(from, to).errors).toBeNull();
  });

  it('should reject numbers when "from" is greater than "to"', () => {
    expect(rangeGroup(50, 10).errors).toEqual({ [INVALID_RANGE_ERROR]: true });
  });

  it('should compare dates too', () => {
    const jan = new Date(2026, 0, 1);
    const feb = new Date(2026, 1, 1);

    expect(rangeGroup(jan, feb).errors).toBeNull();
    expect(rangeGroup(feb, jan).errors).toEqual({ [INVALID_RANGE_ERROR]: true });
  });

  it('should treat zero as a filled value', () => {
    expect(rangeGroup(5, 0).errors).toEqual({ [INVALID_RANGE_ERROR]: true });
  });
});
