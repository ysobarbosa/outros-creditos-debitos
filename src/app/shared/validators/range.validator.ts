import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const INVALID_RANGE_ERROR = 'invalidRange';

/**
 * Group validator for { from, to } groups.
 * Fails when both values are filled and "from" is greater than "to".
 */
export function rangeValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const from = group.get('from')?.value as number | Date | null;
    const to = group.get('to')?.value as number | Date | null;

    if (from == null || to == null) {
      return null;
    }

    return toComparable(from) > toComparable(to) ? { [INVALID_RANGE_ERROR]: true } : null;
  };
}

function toComparable(value: number | Date): number {
  return value instanceof Date ? value.getTime() : value;
}