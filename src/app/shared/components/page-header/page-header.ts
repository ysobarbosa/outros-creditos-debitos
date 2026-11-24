import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface Breadcrumb { 
  label: string;
  href?: string;
}

@Component({
  imports: [],
  selector: 'app-page-header',
  styleUrl: './page-header.scss',
  templateUrl: './page-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly breadcrumbs = input<readonly Breadcrumb[]>([]);
}
