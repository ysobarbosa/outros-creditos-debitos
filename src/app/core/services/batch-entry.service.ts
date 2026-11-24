import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_LATENCY_MS } from '../config/api.config';
import { BatchEntry, NewBatchEntry } from '../models';
import { simulateRequest } from '../utils/simulate-request';

@Injectable({ providedIn: 'root' })
export class BatchEntryService {
  private readonly latencyMs = inject(API_LATENCY_MS);
  private readonly entriesByBatch = new Map<number, BatchEntry[]>();
  private lastId = 0;

  list(batchId: number): Observable<BatchEntry[]> {
    return simulateRequest(() => this.snapshot(batchId), this.latencyMs);
  }

  add(batchId: number, entry: NewBatchEntry): Observable<BatchEntry[]> {
    return simulateRequest(() => {
      this.save(batchId, [...this.entries(batchId), this.build(batchId,entry)]);
      return this.snapshot(batchId);
    }, this.latencyMs);
  }

  update(batchId: number, entry: BatchEntry): Observable<BatchEntry[]> {
    return simulateRequest(() => {
      this.findOrThrow(batchId, entry.id);
      this.save(batchId, this.entries(batchId).map((e) => (e.id === entry.id ? { ...entry } : e)));
      return this.snapshot(batchId);
    }, this.latencyMs);
  }

  remove(batchId: number, entryId: number): Observable<BatchEntry[]> {
    return simulateRequest(() => {
      this.findOrThrow(batchId, entryId);
      this.save(batchId, this.entries(batchId).filter((e) => e.id !== entryId));
      return this.snapshot(batchId);
    }, this.latencyMs);
  }

  duplicate(batchId: number, entryId: number): Observable<BatchEntry[]> {
    return simulateRequest(() => {
      const { id: _id, status: _status, ...data } = this.findOrThrow(batchId, entryId);
      this.save(batchId, [...this.entries(batchId), this.build(batchId, data)]);
      return this.snapshot(batchId);
    }, this.latencyMs);
  }

  private build(batchId: number, entry: NewBatchEntry): BatchEntry {
  return { ...entry, id: ++this.lastId, batchId, status: 'PENDING' };
}

  private entries(batchId: number): BatchEntry[] {
    return this.entriesByBatch.get(batchId) ?? [];
  }

  private save(batchId: number, entries: BatchEntry[]): void {
    this.entriesByBatch.set(batchId, entries);
  }

  private snapshot(batchId: number): BatchEntry[] {
    return this.entries(batchId).map((e) => ({ ...e }));
  }

  private findOrThrow(batchId: number, entryId: number): BatchEntry {
    const entry = this.entries(batchId).find((e) => e.id === entryId);
    if (!entry) {
      throw new Error(`Lançamento ${entryId} não encontrado.`);
    }
    return entry;
  }
}