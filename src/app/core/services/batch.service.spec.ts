import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { API_LATENCY_MS, CURRENT_USER, SIMULATED_ERROR_INSTITUTION } from '../config/api.config';
import { BatchFilter, createEmptyBatchFilter } from '../models';
import { BatchService } from './batch.service';

describe('BatchService', () => {
  let service: BatchService;
  const firstPage = { pageIndex: 0, pageSize: 10 };
  const filter = (overrides: Partial<BatchFilter>): BatchFilter => ({ ...createEmptyBatchFilter(), ...overrides });

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [{ provide: API_LATENCY_MS, useValue: 0 }] });
    service = TestBed.inject(BatchService);
  });

  describe('search', () => {
    it('should return only the requested page and the full total', async () => {
      const result = await firstValueFrom(service.search(createEmptyBatchFilter(), { pageIndex: 1, pageSize: 10 }));

      expect(result.total).toBe(60);
      expect(result.items.map((b) => b.id)).toEqual([1010, 1011, 1012, 1013, 1014, 1015, 1016, 1017, 1018, 1019]);
    });

    it('should apply the filter before paginating', async () => {
      const result = await firstValueFrom(service.search(filter({ status: 'CONFIRMED' }), firstPage));

      expect(result.total).toBe(20);
      expect(result.items.every((b) => b.status === 'CONFIRMED')).toBe(true);
    });

    it('should fail on the simulated error institution', async () => {
      const request = firstValueFrom(service.search(filter({ responsibleInstitution: SIMULATED_ERROR_INSTITUTION }), firstPage));

      await expect(request).rejects.toThrow('Não foi possível consultar os lotes');
    });

    it('should return copies, so callers cannot change the stored data', async () => {
      const first = await firstValueFrom(service.search(createEmptyBatchFilter(), firstPage));
      first.items[0].amount = -1;

      const second = await firstValueFrom(service.search(createEmptyBatchFilter(), firstPage));
      expect(second.items[0].amount).not.toBe(-1);
    });
  });

  describe('status transitions', () => {
    it('should send open batches', async () => {
      const [sent] = await firstValueFrom(service.send([1000]));

      expect(sent.status).toBe('SENT');
    });

    it('should confirm sent batches and record the approver', async () => {
      const [confirmed] = await firstValueFrom(service.confirm([1001]));

      expect(confirmed.status).toBe('CONFIRMED');
      expect(confirmed.approvedBy).toBe(CURRENT_USER);
    });

    it('should refuse to skip a step and change nothing', async () => {
      await expect(firstValueFrom(service.confirm([1000, 1001]))).rejects.toThrow('1000');

      const result = await firstValueFrom(service.search(filter({ idRange: { from: 1001, to: 1001 } }), firstPage));
      expect(result.items[0].status).toBe('SENT');
    });
  });

  describe('create and updateTotals', () => {
    it('should create an open batch at the top of the list', async () => {
      const created = await firstValueFrom(service.create());
      const result = await firstValueFrom(service.search(createEmptyBatchFilter(), firstPage));

      expect(created.status).toBe('OPEN');
      expect(created.id).toBe(1060);
      expect(result.items[0].id).toBe(created.id);
    });

    it('should recalculate amount and entry count from the entries', async () => {
      const created = await firstValueFrom(service.create());
      const updated = await firstValueFrom(
        service.updateTotals(created.id, [{ amount: 150.1 }, { amount: 350.2 }] as never),
      );

      expect(updated.entryCount).toBe(2);
      expect(updated.amount).toBe(500.3);
    });
  });

  it('should remove a batch', async () => {
    await firstValueFrom(service.remove(1000));
    const result = await firstValueFrom(service.search(createEmptyBatchFilter(), firstPage));

    expect(result.total).toBe(59);
    expect(result.items.some((b) => b.id === 1000)).toBe(false);
  });
});
