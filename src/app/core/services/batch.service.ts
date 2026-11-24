import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_LATENCY_MS, CURRENT_USER, SIMULATED_ERROR_INSTITUTION } from '../config/api.config';
import { BATCHES_MOCK } from '../mocks/batches.mock';
import { Batch, BatchEntry, BatchFilter, BatchStatus, PageRequest, PageResult } from '../models';
import { matchesBatchFilter } from '../utils/batch-filter.utils';
import { simulateRequest } from '../utils/simulate-request';

const NEXT_STATUS: Record<BatchStatus, BatchStatus | null> = {
  OPEN: 'SENT',
  SENT: 'CONFIRMED',
  CONFIRMED: null,
};

@Injectable({ providedIn: 'root' })
export class BatchService {
  private readonly latencyMs = inject(API_LATENCY_MS);
  private batches: Batch[] = BATCHES_MOCK.map(cloneBatch);

  search(filter: BatchFilter, page: PageRequest): Observable<PageResult<Batch>> {
    return simulateRequest(() => {
      if (filter.responsibleInstitution?.trim() === SIMULATED_ERROR_INSTITUTION) {
        throw new Error('Não foi possível consultar os lotes. Tente novamente.');
      }
      const filtered = this.batches.filter((batch) => matchesBatchFilter(batch, filter));
      const start = page.pageIndex * page.pageSize;
      return {
        items: filtered.slice(start, start + page.pageSize).map(cloneBatch),
        total: filtered.length,
      };
    }, this.latencyMs);
  }

  create(): Observable<Batch> {
    return simulateRequest(() => {
      const now = new Date();
      const batch: Batch = {
        id: this.nextId(),
        responsibleInstitution: '0101',
        institution: '0101',
        entryDate: now,
        amount: 0,
        entryCount: 0,
        createdBy: CURRENT_USER,
        approvedBy: null,
        status: 'OPEN',
        statusChangedAt: now,
      };
      this.batches = [batch, ...this.batches];
      return cloneBatch(batch);
    }, this.latencyMs);
  }

  /** Recalculates amount and entry count after entries change. */
  updateTotals(batchId: number, entries: readonly BatchEntry[]): Observable<Batch> {
    return simulateRequest(
      () =>
        this.patch(batchId, {
          entryCount: entries.length,
          amount: roundCents(entries.reduce((total, entry) => total + entry.amount, 0)),
        }),
      this.latencyMs,
    );
  }

  send(ids: readonly number[]): Observable<Batch[]> {
    return this.advanceStatus(ids, 'SENT');
  }

  confirm(ids: readonly number[]): Observable<Batch[]> {
    return this.advanceStatus(ids, 'CONFIRMED');
  }

  remove(id: number): Observable<void> {
    return simulateRequest(() => {
      this.findOrThrow(id);
      this.batches = this.batches.filter((batch) => batch.id !== id);
    }, this.latencyMs);
  }

  private advanceStatus(ids: readonly number[], target: BatchStatus): Observable<Batch[]> {
    return simulateRequest(() => {
      const invalid = ids.filter((id) => NEXT_STATUS[this.findOrThrow(id).status] !== target);
      if (invalid.length > 0) {
        throw new Error(`Lote(s) ${invalid.join(', ')} não podem passar para esta situação.`);
      }
      return ids.map((id) =>
        this.patch(id, {
          status: target,
          statusChangedAt: new Date(),
          ...(target === 'CONFIRMED' ? { approvedBy: CURRENT_USER } : {}),
        }),
      );
    }, this.latencyMs);
  }

  private patch(id: number, changes: Partial<Batch>): Batch {
    const updated: Batch = { ...this.findOrThrow(id), ...changes };
    this.batches = this.batches.map((batch) => (batch.id === id ? updated : batch));
    return cloneBatch(updated);
  }

  private findOrThrow(id: number): Batch {
    const batch = this.batches.find((b) => b.id === id);
    if (!batch) {
      throw new Error(`Lote ${id} não encontrado.`);
    }
    return batch;
  }

  private nextId(): number {
    return Math.max(0, ...this.batches.map((b) => b.id)) + 1;
  }
}

function cloneBatch(batch: Batch): Batch {
  return {
    ...batch,
    entryDate: new Date(batch.entryDate),
    statusChangedAt: new Date(batch.statusChangedAt),
  };
}

function roundCents(value: number): number {
  return Math.round(value * 100) / 100;
}