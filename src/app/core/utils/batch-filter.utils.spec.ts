import { buildBatch } from '../../../testing/batch.factory';
import { BatchFilter, createEmptyBatchFilter } from '../models';
import { matchesBatchFilter } from './batch-filter.utils';

describe('matchesBatchFilter', () => {
  const batch = buildBatch({ id: 1005, amount: 500, status: 'SENT', institution: '0202' });
  const filter = (overrides: Partial<BatchFilter>): BatchFilter => ({ ...createEmptyBatchFilter(), ...overrides });

  it('should match everything with an empty filter', () => {
    expect(matchesBatchFilter(batch, createEmptyBatchFilter())).toBe(true);
  });

  it('should filter by status', () => {
    expect(matchesBatchFilter(batch, filter({ status: 'SENT' }))).toBe(true);
    expect(matchesBatchFilter(batch, filter({ status: 'OPEN' }))).toBe(false);
  });

  it('should filter by institution ignoring surrounding spaces', () => {
    expect(matchesBatchFilter(batch, filter({ institution: ' 0202 ' }))).toBe(true);
    expect(matchesBatchFilter(batch, filter({ institution: '0303' }))).toBe(false);
  });

  it('should combine id and amount ranges', () => {
    expect(matchesBatchFilter(batch, filter({ idRange: { from: 1000, to: 1010 }, amountRange: { from: 100, to: 600 } }))).toBe(true);
    expect(matchesBatchFilter(batch, filter({ idRange: { from: 1000, to: 1010 }, amountRange: { from: 600, to: null } }))).toBe(false);
  });
});
