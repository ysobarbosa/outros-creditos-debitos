import { Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { BATCH_STATUS_OPTIONS, BatchFilter } from '../../../../core/models';
import { RangeErrorStateMatcher } from '../../../../shared/forms/range-error-state-matcher';
import { rangeValidator } from '../../../../shared/validators/range.validator';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

const INSTITUTION_PATTERN = /^\d{1,4}$/;
@Component({
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  selector: 'app-batch-filters',
  styleUrl: './batch-filters.scss',
  templateUrl: './batch-filters.html',
})
export class BatchFilters {
  private readonly formBuilder = inject(FormBuilder);

  readonly loading = input(false);
  readonly filterApplied = output<BatchFilter>()

  protected readonly statusOptions = BATCH_STATUS_OPTIONS;
  protected readonly rangeMatcher = new RangeErrorStateMatcher();

  protected readonly form = this.formBuilder.group({
    responsibleInstitution: this.formBuilder.control<string | null>(null, Validators.pattern(INSTITUTION_PATTERN)),
    institution: this.formBuilder.control<string | null>(null, Validators.pattern(INSTITUTION_PATTERN)),
    status: this.formBuilder.control<string | null>(null),
    idRange: this.rangeGroup<number>(Validators.min(1)),
    amountRange: this.rangeGroup<number>(Validators.min(0)),
    dateRange: this.rangeGroup<Date>(),
  });

  protected readonly controls = this.form.controls;

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.filterApplied.emit(this.form.getRawValue())
  }

  protected clear(): void {
    this.form.reset();
    this.filterApplied.emit(this.form.getRawValue());
  }

  /**
   * simplifica o formulário de range, evitando repetição de código para cada range (id, amount, date)
   */
  private rangeGroup<T extends number | Date>(...validators: ValidatorFn[]) {
     return this.formBuilder.group(
      {
        from: this.formBuilder.control<T | null>(null, validators),
        to: this.formBuilder.control<T | null>(null, validators),
      },
      { validators: rangeValidator() },
    );
  }
}
