import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_LATENCY_MS } from '../config/api.config';
import { ACCOUNTS_MOCK } from '../mocks/accounts.mock';
import { Account } from '../models';
import { simulateRequest } from '../utils/simulate-request';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly latencyMs = inject(API_LATENCY_MS);

  findByNumber(accountNumber: string): Observable<Account | null> {
    return simulateRequest(() => {
      const account = ACCOUNTS_MOCK.find((a) => a.number === accountNumber.trim());
      return account ? { ...account } : null;
    }, this.latencyMs);
  }
}