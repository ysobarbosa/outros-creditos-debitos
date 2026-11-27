import { LOCALE_ID, Provider } from '@angular/core';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { API_LATENCY_MS } from '../app/core/config/api.config';
import { PtBrPaginatorIntl } from '../app/shared/i18n/pt-br-paginator-intl';

/** Providers that app.config.ts gives the real app, plus zero latency for the mock API. */
export function provideTestDefaults(): Provider[] {
  return [
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    { provide: MatPaginatorIntl, useClass: PtBrPaginatorIntl },
    { provide: API_LATENCY_MS, useValue: 0 },
    ...provideNativeDateAdapter(),
  ];
}

/** Lets pending timers (mock latency, debounce) run before the next assertion. */
export function wait(ms = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
