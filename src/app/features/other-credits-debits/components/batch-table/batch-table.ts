import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, computed, model } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { Batch } from '../../../../core/models';
import { BatchStatusLabelPipe } from '../../pipes/batch-status-label-pipe';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-batch-table',
  imports: [MatTableModule, CurrencyPipe, DatePipe, BatchStatusLabelPipe, MatCheckboxModule],
  templateUrl: './batch-table.html',
  styleUrl: './batch-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BatchTable {
  readonly batches = input.required<readonly Batch[]>();
   readonly selected = model<readonly Batch[]>([]);

  protected readonly columns: string[] = [
    'select',
    'id',
    'entryDate',
    'amount',
    'entryCount',
    'createdBy',
    'approvedBy',
    'status',
    'statusChangedAt',
  ];

  protected readonly trackById = (_index: number, batch: Batch): number => batch.id;
  protected readonly selectedIds = computed(() => new Set(this.selected().map((b) => b.id)));

  protected readonly allSelected = computed(
    () => this.batches().length > 0 && this.batches().every((b) => this.selectedIds().has(b.id)),
  );

  protected readonly someSelected = computed(() => this.selected().length > 0 && !this.allSelected());

  protected toggle(batch: Batch): void {
    this.selected.update((current) =>
      this.selectedIds().has(batch.id)
        ? current.filter((b) => b.id !== batch.id)
        : [...current, batch],
    );
  }

  protected toggleAll(): void {
    this.selected.set(this.allSelected() ? [] : [...this.batches()]);
  }
}
