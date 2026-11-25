import { Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Batch, BatchStatus } from '../../../../core/models';

export type BatchAction =
  | 'confirm'
  | 'send'
  | 'viewJustification'
  | 'create'
  | 'edit'
  | 'delete'
  | 'view';

@Component({
  imports: [MatButtonModule],
  selector: 'app-batch-actions',
  styleUrl: './batch-actions.scss',
  templateUrl: './batch-actions.html',
})
export class BatchActions {
   readonly selected = input.required<readonly Batch[]>();
  readonly busy = input(false);
  readonly actionTriggered = output<BatchAction>();

  protected readonly count = computed(() => this.selected().length);
  protected readonly hasSingle = computed(() => this.count() === 1);
  protected readonly canSend = computed(() => this.allHaveStatus('OPEN'));
  protected readonly canConfirm = computed(() => this.allHaveStatus('SENT'));

  protected trigger(action: BatchAction): void {
    this.actionTriggered.emit(action);
  }

  private allHaveStatus(status: BatchStatus): boolean {
    const selected = this.selected();
    return selected.length > 0 && selected.every((batch) => batch.status === status);
  }
}
