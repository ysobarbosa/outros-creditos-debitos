import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { HISTORY_OPTIONS_MOCK } from '../../../../core/mocks/options.mock';
import { BatchEntry, ENTRY_STATUS_LABEL, EntryStatus } from '../../../../core/models';

@Component({
  selector: 'app-entry-table',
  imports: [MatTableModule, MatCheckboxModule, CurrencyPipe],
  templateUrl: './entry-table.html',
  styleUrl: './entry-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntryTable {
  readonly entries = input.required<readonly BatchEntry[]>();
  readonly selectedId = model<number | null>(null);
  readonly disabled = input(false);

  protected readonly columns: string[] = [
    'select',
    'accountNumber',
    'accountOwner',
    'amount',
    'history',
    'document',
    'isReversal',
    'status',
  ];

  protected readonly historyLabels = new Map(HISTORY_OPTIONS_MOCK.map((o) => [o.value, o.label]));
  

  protected toggle(entry: BatchEntry): void {
    this.selectedId.update((current) => (current === entry.id ? null : entry.id));
  }

  protected statusLabel(status: EntryStatus): string {
  return ENTRY_STATUS_LABEL[status];
}
}
