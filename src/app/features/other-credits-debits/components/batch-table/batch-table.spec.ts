import { TestBed } from '@angular/core/testing';
import { provideTestDefaults } from '../../../../../testing/test-providers';
import { buildBatch } from '../../../../../testing/batch.factory';
import { Batch } from '../../../../core/models';
import { BatchTable } from './batch-table';

describe('BatchTable', () => {
  async function setup(batches: Batch[]) {
    await TestBed.configureTestingModule({
      imports: [BatchTable],
      providers: provideTestDefaults(),
    }).compileComponents();

    const fixture = TestBed.createComponent(BatchTable);
    fixture.componentRef.setInput('batches', batches);
    await fixture.whenStable();
    return fixture;
  }

  it('should format amount and dates in pt-BR', async () => {
    const fixture = await setup([buildBatch({ amount: 1500.5 })]);
    const row = (fixture.nativeElement as HTMLElement).querySelector('tr[mat-row]')!;

    expect(row.textContent).toContain('R$');
    expect(row.textContent).toContain('1.500,50');
    expect(row.textContent).toContain('10/01/2026');
    expect(row.textContent).toContain('10/01/2026 16:00');
    expect(row.textContent).toContain('Aberto');
  });

  it('should show the empty state when there are no batches', async () => {
    const fixture = await setup([]);

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Nenhum lote encontrado.');
  });

  it('should select all batches of the page and clear them again', async () => {
    const batches = [buildBatch({ id: 1 }), buildBatch({ id: 2 })];
    const fixture = await setup(batches);
    const headerCheckbox = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
      'th input[type="checkbox"]',
    )!;

    headerCheckbox.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.selected().map((b) => b.id)).toEqual([1, 2]);

    headerCheckbox.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.selected()).toEqual([]);
  });
});
