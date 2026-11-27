import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { API_LATENCY_MS } from '../config/api.config';
import { NewBatchEntry } from '../models';
import { BatchEntryService } from './batch-entry.service';

const NEW_ENTRY: NewBatchEntry = {
  accountNumber: '10001',
  accountOwner: 'Ana Beatriz Ferreira',
  amount: 150.5,
  historyId: 1,
  isReversal: false,
  document: 'DOC-1',
  description: null,
  branch: '01',
  eventId: null,
  historyComplement: 'Complemento',
  cscDocumentId: null,
};

describe('BatchEntryService', () => {
  let service: BatchEntryService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [{ provide: API_LATENCY_MS, useValue: 0 }] });
    service = TestBed.inject(BatchEntryService);
  });

  it('should assign id, batch and pending status when adding', async () => {
    const [entry] = await firstValueFrom(service.add(7, NEW_ENTRY));

    expect(entry).toEqual({ ...NEW_ENTRY, id: 1, batchId: 7, status: 'PENDING' });
  });

  it('should keep entries separated by batch', async () => {
    await firstValueFrom(service.add(7, NEW_ENTRY));

    expect(await firstValueFrom(service.list(8))).toEqual([]);
  });

  it('should duplicate an entry as a new pending entry', async () => {
    const [original] = await firstValueFrom(service.add(7, NEW_ENTRY));
    const entries = await firstValueFrom(service.duplicate(7, original.id));

    expect(entries).toHaveLength(2);
    expect(entries[1].id).not.toBe(original.id);
    expect(entries[1].document).toBe(original.document);
  });

  it('should update and remove entries', async () => {
    const [original] = await firstValueFrom(service.add(7, NEW_ENTRY));

    const [updated] = await firstValueFrom(service.update(7, { ...original, amount: 99 }));
    expect(updated.amount).toBe(99);

    expect(await firstValueFrom(service.remove(7, original.id))).toEqual([]);
  });

  it('should fail for an entry that does not exist', async () => {
    await expect(firstValueFrom(service.remove(7, 123))).rejects.toThrow('Lançamento 123 não encontrado.');
  });
});
