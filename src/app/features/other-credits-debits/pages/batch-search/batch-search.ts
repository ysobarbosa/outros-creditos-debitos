import { ChangeDetectionStrategy, Component, computed, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { catchError, debounceTime, of, switchMap, tap, Observable, filter, finalize, ignoreElements, map } from 'rxjs';
import { Batch, BatchFilter, PageRequest, PageResult, createEmptyBatchFilter } from '../../../../core/models';
import { BatchService } from '../../../../core/services/batch.service';
import { Breadcrumb, PageHeader } from '../../../../shared/components/page-header/page-header';
import { BatchFilters } from '../../components/batch-filters/batch-filters';
import { BatchTable } from '../../components/batch-table/batch-table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BatchAction, BatchActions } from '../../components/batch-actions/batch-actions';
import { ConfirmDialog, ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { EntryDialog, EntryDialogData, EntryDialogResult } from '../../components/entry-dialog/entry-dialog';

interface SearchQuery {
  filter: BatchFilter;
  page: PageRequest;
}

const SEARCH_DEBOUNCE_MS = 300;
const INITIAL_PAGE: PageRequest = { pageIndex: 0, pageSize: 10 };
const EMPTY_RESULT: PageResult<Batch> = { items: [], total: 0 };

@Component({
  selector: 'app-batch-search',
  imports: [PageHeader, BatchFilters, BatchTable, MatProgressBarModule, MatButtonModule, MatPaginatorModule, BatchActions,],
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

  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly acting = signal(false);

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
        const { pageIndex, pageSize } = this.query().page;
        const lastPage = Math.max(0, Math.ceil(result.total / pageSize) - 1);

        if (result.items.length === 0 && pageIndex > lastPage) {
          this.query.update((current) => ({ ...current, page: { ...current.page, pageIndex: lastPage } }));
          return;
        }

        this.result.set(result);
        this.selected.set([]);
        this.loading.set(false);
      });
  }

  protected onFilterApplied(filter: BatchFilter): void {
    this.query.update((current) => ({ filter, page: { ...current.page, pageIndex: 0 } }));
  }

  protected refresh(): void {
    this.query.update((current) => ({ ...current }));
  }

  protected onPageChange(event: PageEvent): void {
    this.query.update((current) => ({
      ...current,
      page: { pageIndex: event.pageIndex, pageSize: event.pageSize },
    }));
  }

  protected onAction(action: BatchAction): void {
    const selected = this.selected();
    const ids = selected.map((batch) => batch.id);

    switch (action) {
      case 'send':
        return this.runAction(this.batchService.send(ids), 'Lote(s) enviado(s) com sucesso.');
      case 'confirm':
        return this.runAction(this.batchService.confirm(ids), 'Lote(s) confirmado(s) com sucesso.');
      case 'delete':
        return this.confirmDelete(selected[0]);
      case 'create':
        return this.createBatch();
      case 'edit':
        return this.editBatch(selected[0]);
      case 'view':
      case 'viewJustification':
        return this.notify('Funcionalidade fora do escopo deste desafio.');
      default:
        return assertNever(action);
    }
  }

  private confirmDelete(batch: Batch): void {
    const request$ = this.dialog
      .open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
        data: {
          title: 'Excluir lote',
          message: `Deseja excluir o lote ${batch.id}? Esta ação não pode ser desfeita.`,
          confirmLabel: 'Excluir',
        },
      })
      .afterClosed()
      .pipe(
        filter((confirmed): confirmed is true => confirmed === true),
        switchMap(() => this.batchService.remove(batch.id)),
      );

    this.runAction(request$, `Lote ${batch.id} excluído com sucesso.`);
  }

  private runAction(request$: Observable<unknown>, successMessage: string): void {
    this.acting.set(true);
    request$
      .pipe(
        finalize(() => this.acting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.notify(successMessage);
          this.refresh();
        },
        error: (err: unknown) => this.notify(toErrorMessage(err)),
      });
  }


  private notify(message: string): void {
    this.snackBar.open(message, 'Fechar', { duration: 4000 });
  }

  private createBatch(): void {
    const request$ = this.batchService.create().pipe(
      switchMap((batch) =>
        this.openEntryDialog(batch).pipe(
          switchMap((result) =>
            result.entries.length > 0
              ? this.batchService.updateTotals(batch.id, result.entries)
              : this.batchService.remove(batch.id).pipe(ignoreElements()),
          ),
        ),
      ),
    );
    this.runAction(request$, 'Lote incluído com sucesso.');
  }

  private editBatch(batch: Batch): void {
    if (batch.status !== 'OPEN') {
      this.notify('Apenas lotes abertos podem ser alterados.');
      return;
    }
    const request$ = this.openEntryDialog(batch).pipe(
      filter((result) => result.changed),
      switchMap((result) => this.batchService.updateTotals(batch.id, result.entries)),
    );
    this.runAction(request$, `Lote ${batch.id} atualizado com sucesso.`);
  }

  private openEntryDialog(batch: Batch) {
    return this.dialog
      .open<EntryDialog, EntryDialogData, EntryDialogResult>(EntryDialog, {
        data: { batch },
        width: '960px',
        maxWidth: '95vw',
        autoFocus: 'first-tabbable',
      })
      .afterClosed()
      .pipe(map((result) => result ?? { entries: [], changed: false }));
  }
}

function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Ocorreu um erro inesperado.';
}

function assertNever(value: never): never {
  throw new Error(`Unhandled action: ${String(value)}`);
}