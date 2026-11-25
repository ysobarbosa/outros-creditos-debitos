import { Pipe, PipeTransform } from '@angular/core';
import { BATCH_STATUS_LABEL, BatchStatus } from '../../../core/models';

@Pipe({ name: 'batchStatusLabel' })
export class BatchStatusLabelPipe implements PipeTransform {
  transform(status: BatchStatus): string {
    return BATCH_STATUS_LABEL[status];
  }
}
