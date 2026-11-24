import { Batch, BATCH_STATUSES } from '../models';

const USERS = ['joao.silva', 'maria.souza', 'carlos.lima', 'ana.costa'];
const INSTITUTIONS = ['0101', '0202', '0303', '0404', '0505'];
const HOUR_MS = 60 * 60 * 1000;

function buildBatch(i: number): Batch {
  const status = BATCH_STATUSES[i % BATCH_STATUSES.length];
  const entryDate = new Date(2026, 0, 1 + i * 3, 9, 0);
  const amount = Number((((i * 7919) % 500_000) / 100 + 100).toFixed(2));

  return {
    id: 1000 + i,
    responsibleInstitution: INSTITUTIONS[i % INSTITUTIONS.length],
    institution: INSTITUTIONS[(i + 2) % INSTITUTIONS.length],
    entryDate,
    amount,
    entryCount: (i % 12) + 1,
    createdBy: USERS[i % USERS.length],
    approvedBy: status === 'CONFIRMED' ? USERS[(i + 1) % USERS.length] : null,
    status,
    statusChangedAt: new Date(entryDate.getTime() + ((i % 5) + 1) * 7 * HOUR_MS),
  };
}

export const BATCHES_MOCK: Batch[] = Array.from({ length: 60 }, (_, i) => buildBatch(i));