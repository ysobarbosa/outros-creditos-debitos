import { Batch } from '../app/core/models';

/** Builds a valid batch for tests; override only what the test cares about. */
export function buildBatch(overrides: Partial<Batch> = {}): Batch {
  return {
    id: 1,
    responsibleInstitution: '0101',
    institution: '0202',
    entryDate: new Date(2026, 0, 10, 9, 0),
    amount: 100,
    entryCount: 1,
    createdBy: 'joao.silva',
    approvedBy: null,
    status: 'OPEN',
    statusChangedAt: new Date(2026, 0, 10, 16, 0),
    ...overrides,
  };
}
