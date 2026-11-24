import { Batch, BatchFilter } from '../models';
import { isDateInRange, isInRange } from './range.utils';

/**
 * Checks if a batch matches the given filter criteria
 */
export function matchesBatchFilter(batch: Batch, filter: BatchFilter): boolean {
  return (
    matchesText(batch.responsibleInstitution, filter.responsibleInstitution) &&
    matchesText(batch.institution, filter.institution) &&
    (filter.status === 'ALL' || batch.status === filter.status) &&
    isInRange(batch.id, filter.idRange) &&
    isInRange(batch.amount, filter.amountRange) &&
    isDateInRange(batch.entryDate, filter.dateRange)
  );
}

function matchesText(value: string, term: string | null): boolean {
  const trimmed = term?.trim();
  return !trimmed || value.includes(trimmed);
}