import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BatchSearch } from './features/other-credits-debits/pages/batch-search/batch-search';

@Component({
  imports: [BatchSearch],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
}
