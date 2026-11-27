import { TestBed } from '@angular/core/testing';
import { provideTestDefaults, wait } from '../../../../../testing/test-providers';
import { BatchSearch } from './batch-search';

describe('BatchSearch', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BatchSearch],
      providers: provideTestDefaults(),
    }).compileComponents();
  });

  it('should load the first page of batches on start', async () => {
    const fixture = TestBed.createComponent(BatchSearch);
    await fixture.whenStable();
    // debounceTime and the mock latency use real timers, so wait for them to finish
    await wait(400);
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll('tr[mat-row]')).toHaveLength(10);
    expect(element.textContent).toContain('Página 1 de 6');
  });
});
