import { AbstractControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { INVALID_RANGE_ERROR } from '../validators/range.validator';

/** Shows a field as invalid when its own value is invalid OR its parent range group is invalid. */
export class RangeErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: AbstractControl | null, form: FormGroupDirective | NgForm | null): boolean {
    if (!control) {
      return false;
    }
    const interacted = control.touched || !!form?.submitted;
    const groupInvalid = !!control.parent?.hasError(INVALID_RANGE_ERROR);
    return interacted && (control.invalid || groupInvalid);
  }
}