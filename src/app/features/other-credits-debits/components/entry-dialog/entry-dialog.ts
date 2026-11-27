import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { filter, finalize, merge, Observable, switchMap } from 'rxjs';
import { BRANCH_OPTIONS_MOCK, HISTORY_OPTIONS_MOCK } from '../../../../core/mocks/options.mock';
import { Batch, BatchEntry, ENTRY_STATUS_LABEL, NewBatchEntry } from '../../../../core/models';
import { AccountService } from '../../../../core/services/account.service';
import { BatchEntryService } from '../../../../core/services/batch-entry.service';

import { ACCOUNT_NOT_FOUND_ERROR, validationMessage } from '../../../../shared/forms/validation-messages';
import { positiveValueValidator } from '../../../../shared/validators/positive-value.validator';
import { CurrencyInputDirective } from '../../../../shared/directives/currency-input.directive';
import { ConfirmDialog, ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { EntryTable } from '../entry-table/entry-table';

export interface EntryDialogData {
  batch: Batch;
}

export interface EntryDialogResult {
  entries: BatchEntry[];
  changed: boolean;
}

const ACCOUNT_PATTERN = /^\d{5}$/;
const EVENT_ID_PATTERN = /^\d{1,6}$/;
const CSC_DOCUMENT_ID_PATTERN = /^\d{1,10}$/;
const CSC_STATUS_LABEL = 'Aguardando Processamento CCO';
type FormMode = 'create' | 'edit' | 'view';

@Component({
  selector: 'app-entry-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    CurrencyInputDirective,
    EntryTable
  ],
  templateUrl: './entry-dialog.html',
  styleUrl: './entry-dialog.scss',
})
export class EntryDialog {
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly dialogRef = inject<MatDialogRef<EntryDialog, EntryDialogResult>>(MatDialogRef);
  private readonly accountService = inject(AccountService);
  private readonly entryService = inject(BatchEntryService);
  protected readonly data = inject<EntryDialogData>(MAT_DIALOG_DATA);

  private readonly formDirective = viewChild.required(FormGroupDirective);

  protected readonly historyOptions = HISTORY_OPTIONS_MOCK;
  protected readonly branchOptions = BRANCH_OPTIONS_MOCK;
  protected readonly pendingLabel = ENTRY_STATUS_LABEL.PENDING;
  protected readonly cscStatusLabel = CSC_STATUS_LABEL;

  protected readonly entries = signal<BatchEntry[]>([]);
  protected readonly searchingAccount = signal(false);
  protected readonly saving = signal(false);
  /** Screen preference (not entry data): keep the form filled after including. */
  protected readonly keepData = signal(false);
  protected readonly error = signal<string | null>(null);
  private changed = false;
  protected readonly mode = signal<FormMode>('create');
  protected readonly selectedId = signal<number | null>(null);
  protected readonly selectedEntry = computed(
    () => this.entries().find((entry) => entry.id === this.selectedId()) ?? null,
  );
  protected readonly canActOnSelection = computed(
    () => this.selectedEntry() !== null && this.mode() === 'create' && !this.saving(),
  );
  private editingEntry: BatchEntry | null = null;

  protected readonly form = this.fb.group({
    accountNumber: this.fb.control<string | null>(null, [Validators.required, Validators.pattern(ACCOUNT_PATTERN)]),
    accountOwner: this.fb.nonNullable.control('', Validators.required),
    amount: this.fb.control<number | null>(null, [Validators.required, positiveValueValidator()]),
    historyId: this.fb.control<number | null>(null, Validators.required),
    isReversal: this.fb.nonNullable.control(false),
    document: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(20)]),
    description: this.fb.control<string | null>(null, Validators.maxLength(200)),
    branch: this.fb.control<string | null>(null, Validators.required),
    eventId: this.fb.control<string | null>(null, Validators.pattern(EVENT_ID_PATTERN)),
    historyComplement: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(200)]),
    cscDocumentId: this.fb.control<string | null>(null, Validators.pattern(CSC_DOCUMENT_ID_PATTERN)),
  });

  protected readonly controls = this.form.controls;
  protected readonly messageFor = validationMessage;

  constructor() {
    // Esc and backdrop click go through close(), so the page always receives the result.
    this.dialogRef.disableClose = true;
    merge(
      this.dialogRef.backdropClick(),
      this.dialogRef.keydownEvents().pipe(filter((event) => event.key === 'Escape')),
    )
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.close());

    // A new account number invalidates the owner found before.
    this.controls.accountNumber.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.controls.accountOwner.setValue(''));

    this.entryService
      .list(this.data.batch.id)
      .pipe(takeUntilDestroyed())
      .subscribe((entries) => this.entries.set(entries));
  }

  protected searchAccount(): void {
    const control = this.controls.accountNumber;
    if (control.invalid) {
      control.markAsTouched();
      return;
    }

    const accountNumber = control.value!;
    this.searchingAccount.set(true);

    this.accountService
      .findByNumber(accountNumber)
      .pipe(finalize(() => this.searchingAccount.set(false)))
      .subscribe({
        next: (account) => {
          if (control.value !== accountNumber) {
            return;
          }
          if (account) {
            this.controls.accountOwner.setValue(account.holderName);
          } else {
            control.setErrors({ [ACCOUNT_NOT_FOUND_ERROR]: true });
            control.markAsTouched();
          }
        },
        error: (err: unknown) => this.error.set(toErrorMessage(err)),
      });
  }

  protected submit(): void {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  if (this.mode() === 'edit' && this.editingEntry) {
    const updated: BatchEntry = { ...this.editingEntry, ...this.toNewEntry() };
    this.applyEntries(this.entryService.update(this.data.batch.id, updated), () => this.backToCreate());
  } else {
    this.applyEntries(this.entryService.add(this.data.batch.id, this.toNewEntry()), () => {
      if (!this.keepData()) {
        this.resetForm();
      }
    });
  }
}

protected view(): void {
  const entry = this.selectedEntry();
  if (!entry) return;
  this.loadIntoForm(entry);
  this.form.disable();
  this.mode.set('view');
}

protected edit(): void {
  const entry = this.selectedEntry();
  if (!entry) return;
  this.loadIntoForm(entry);
  this.editingEntry = entry;
  this.mode.set('edit');
}

protected remove(): void {
  const entry = this.selectedEntry();
  if (!entry) return;

  const request$ = this.dialog
    .open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
      data: {
        title: 'Excluir lançamento',
        message: `Deseja excluir o lançamento da conta ${entry.accountNumber}?`,
        confirmLabel: 'Excluir',
      },
    })
    .afterClosed()
    .pipe(
      filter((confirmed): confirmed is true => confirmed === true),
      switchMap(() => this.entryService.remove(this.data.batch.id, entry.id)),
    );

  this.applyEntries(request$);
}

protected duplicate(): void {
  const entry = this.selectedEntry();
  if (!entry) return;
  this.applyEntries(this.entryService.duplicate(this.data.batch.id, entry.id));
}

protected backToCreate(): void {
  this.editingEntry = null;
  this.form.enable();
  this.resetForm();
  this.mode.set('create');
}

private loadIntoForm(entry: BatchEntry): void {
  this.form.patchValue(entry, { emitEvent: false });
}

private applyEntries(request$: Observable<BatchEntry[]>, afterSuccess?: () => void): void {
  this.saving.set(true);
  this.error.set(null);

  request$.pipe(finalize(() => this.saving.set(false))).subscribe({
    next: (entries) => {
      this.entries.set(entries);
      this.changed = true;
      this.selectedId.set(null);
      afterSuccess?.();
    },
    error: (err: unknown) => this.error.set(toErrorMessage(err)),
  });
}
  protected close(): void {
    this.dialogRef.close({ entries: this.entries(), changed: this.changed });
  }

  protected isInvalid(control: AbstractControl): boolean {
    return control.invalid && (control.touched || this.formDirective().submitted);
  }

  private resetForm(): void {
    this.formDirective().resetForm();
  }

  private toNewEntry(): NewBatchEntry {
    const value = this.form.getRawValue();
    return {
      accountNumber: value.accountNumber!,
      accountOwner: value.accountOwner,
      amount: value.amount!,
      historyId: value.historyId!,
      isReversal: value.isReversal,
      document: value.document.trim(),
      description: value.description?.trim() || null,
      branch: value.branch,
      eventId: value.eventId?.trim() || null,
      historyComplement: value.historyComplement.trim(),
      cscDocumentId: value.cscDocumentId?.trim() || null,
    };
  }
}

function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Ocorreu um erro inesperado.';
}