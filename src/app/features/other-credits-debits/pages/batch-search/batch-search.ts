import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Breadcrumb, PageHeader } from '../../../../shared/components/page-header/page-header';
import { BatchFilter } from '../../../../core/models';
import { BatchFilters } from '../../components/batch-filters/batch-filters';

@Component({
  imports: [PageHeader, BatchFilters],
  selector: 'app-batch-search',
  styleUrl: './batch-search.scss',
  templateUrl: './batch-search.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BatchSearch {
  protected readonly breadcrumbs: readonly Breadcrumb[] = [
    { label: 'Início', href: '/' },
    { label: 'Outros Créditos/Débitos' },
  ];
  protected onFilterApplied(filter: BatchFilter): void {
    console.log('filter', filter); // Step 6: call the service here
  }
}
