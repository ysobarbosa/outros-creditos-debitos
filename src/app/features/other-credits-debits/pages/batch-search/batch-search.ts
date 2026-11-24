import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Breadcrumb, PageHeader } from '../../../../shared/components/page-header/page-header';

@Component({
  imports: [PageHeader],
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
}
