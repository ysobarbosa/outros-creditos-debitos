import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { Batch } from '../../../../core/models';
import { BatchStatusLabelPipe } from '../../pipes/batch-status-label-pipe';

@Component({
  selector: 'app-batch-table',
  imports: [MatTableModule, CurrencyPipe, DatePipe, BatchStatusLabelPipe],
  templateUrl: './batch-table.html',
  styleUrl: './batch-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BatchTable {
  readonly batches = input.required<readonly Batch[]>();

  protected readonly columns: string[] = [
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
}
