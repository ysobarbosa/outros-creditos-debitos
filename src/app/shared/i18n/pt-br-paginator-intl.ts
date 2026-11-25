import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

@Injectable()
export class PtBrPaginatorIntl extends MatPaginatorIntl {
  override itemsPerPageLabel = 'Itens por página:';
  override firstPageLabel = 'Primeira página';
  override previousPageLabel = 'Página anterior';
  override nextPageLabel = 'Próxima página';
  override lastPageLabel = 'Última página';

  override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0) {
      return 'Nenhum registro';
    }
    const totalPages = Math.ceil(length / pageSize);
    return `Página ${page + 1} de ${totalPages} (${length} registros)`;
  };
}