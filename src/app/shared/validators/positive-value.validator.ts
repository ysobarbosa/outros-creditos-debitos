import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const POSITIVE_VALUE_ERROR = 'positiveValue';

/** Fails when the value is zero or negative. Empty values are left to Validators.required. */
export function positiveValueValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as number | null;
    if (value == null) {
      return null;
    }
    return value > 0 ? null : { [POSITIVE_VALUE_ERROR]: true };
  };
}