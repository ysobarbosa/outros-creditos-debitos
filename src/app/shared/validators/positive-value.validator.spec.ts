import { FormControl } from '@angular/forms';
import { POSITIVE_VALUE_ERROR, positiveValueValidator } from './positive-value.validator';

describe('positiveValueValidator', () => {
  const validate = (value: number | null) => positiveValueValidator()(new FormControl(value));

  it('should leave empty values to Validators.required', () => {
    expect(validate(null)).toBeNull();
  });

  it.each([0.01, 1, 1500.5])('should accept %s', (value) => {
    expect(validate(value)).toBeNull();
  });

  it.each([0, -1])('should reject %s', (value) => {
    expect(validate(value)).toEqual({ [POSITIVE_VALUE_ERROR]: true });
  });
});
