import { BatchStatus } from './batch.model';
import { Range, emptyRange } from './range.model';

export type BatchStatusFilter = BatchStatus | 'ALL';

export interface BatchFilter {
  responsibleInstitution: string | null;
  institution: string | null;
  status: BatchStatusFilter;
  idRange: Range<number>;
  amountRange: Range<number>;
  dateRange: Range<Date>;
}

export function createEmptyBatchFilter(): BatchFilter {
  return {
    responsibleInstitution: null,
    institution: null,
    status: 'ALL',
    idRange: emptyRange<number>(),
    amountRange: emptyRange<number>(),
    dateRange: emptyRange<Date>(),
  };
}