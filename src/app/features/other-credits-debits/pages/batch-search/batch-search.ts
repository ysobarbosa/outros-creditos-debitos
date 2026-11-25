import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { catchError, debounceTime, of, switchMap, tap } from 'rxjs';
import { Batch, BatchFilter, PageRequest, PageResult, createEmptyBatchFilter } from '../../../../core/models';
import { BatchService } from '../../../../core/services/batch.service';
import { Breadcrumb, PageHeader } from '../../../../shared/components/page-header/page-header';
import { BatchFilters } from '../../components/batch-filters/batch-filters';
import { BatchTable } from '../../components/batch-table/batch-table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

interface SearchQuery {
  filter: BatchFilter;
  page: PageRequest;
}

const SEARCH_DEBOUNCE_MS = 300;
const INITIAL_PAGE: PageRequest = { pageIndex: 0, pageSize: 10 };
const EMPTY_RESULT: PageResult<Batch> = { items: [], total: 0 };

@Component({
  selector: 'app-batch-search',
  imports: [PageHeader, BatchFilters, BatchTable, MatProgressBarModule, MatButtonModule, MatPaginatorModule],
  templateUrl: './batch-search.html',
  styleUrl: './batch-search.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BatchSearch {
  private readonly batchService = inject(BatchService);

  protected readonly breadcrumbs: readonly Breadcrumb[] = [
    { label: 'Início', href: '/' },
    { label: 'Outros Créditos/Débitos' },
  ];

  // State
  private readonly query = signal<SearchQuery>({
    filter: createEmptyBatchFilter(),
    page: INITIAL_PAGE,
  });
  private readonly result = signal<PageResult<Batch>>(EMPTY_RESULT);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  // Derived state
  protected readonly batches = computed(() => this.result().items);
  protected readonly total = computed(() => this.result().total);
  protected readonly page = computed(() => this.query().page);
  protected readonly pageSizeOptions = [10, 25, 50];

  protected readonly selected = signal<readonly Batch[]>([]);

  constructor() {
    toObservable(this.query)
      .pipe(
        debounceTime(SEARCH_DEBOUNCE_MS),
        tap(() => {
          this.loading.set(true);
          this.error.set(null);
        }),
        switchMap(({ filter, page }) =>
          this.batchService.search(filter, page).pipe(
            catchError((err: unknown) => {
              this.error.set(toErrorMessage(err));
              return of(EMPTY_RESULT);
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((result) => {
        this.result.set(result);
        this.loading.set(false);
      });
  }

  protected onFilterApplied(filter: BatchFilter): void {
    this.query.update((current) => ({ filter, page: { ...current.page, pageIndex: 0 } }));
  }

  protected retry(): void {
    this.query.update((current) => ({ ...current }));
  }

  protected onPageChange(event: PageEvent): void {
  this.query.update((current) => ({
    ...current,
    page: { pageIndex: event.pageIndex, pageSize: event.pageSize },
  }));
}
}

function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Ocorreu um erro inesperado.';
}