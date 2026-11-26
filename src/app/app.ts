import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BatchSearch } from './features/other-credits-debits/pages/batch-search/batch-search';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  imports: [BatchSearch, MatToolbarModule],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
}
