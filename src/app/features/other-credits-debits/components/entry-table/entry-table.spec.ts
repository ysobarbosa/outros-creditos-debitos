import { TestBed } from '@angular/core/testing';
import { provideTestDefaults } from '../../../../../testing/test-providers';
import { BatchEntry } from '../../../../core/models';
import { EntryTable } from './entry-table';

const ENTRY: BatchEntry = {
  id: 7,
  batchId: 1,
  accountNumber: '10001',
  accountOwner: 'Ana Beatriz Ferreira',
  amount: 150.5,
  historyId: 1,
  isReversal: false,
  document: 'DOC-1',
  description: null,
  status: 'PENDING',
  branch: '01',
  eventId: null,
  historyComplement: 'Complemento',
  cscDocumentId: null,
};

describe('EntryTable', () => {
  async function setup(entries: BatchEntry[]) {
    await TestBed.configureTestingModule({
      imports: [EntryTable],
      providers: provideTestDefaults(),
    }).compileComponents();

    const fixture = TestBed.createComponent(EntryTable);
    fixture.componentRef.setInput('entries', entries);
    await fixture.whenStable();
    return fixture;
  }

  it('should show labels instead of codes', async () => {
    const fixture = await setup([ENTRY]);
    const row = (fixture.nativeElement as HTMLElement).querySelector('tr[mat-row]')!;

    expect(row.textContent).toContain('Lançamento Manual');
    expect(row.textContent).toContain('Pendente');
    expect(row.textContent).toContain('Não');
  });

  it('should keep a single selection and toggle it off on a second click', async () => {
    const fixture = await setup([ENTRY]);
    const checkbox = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
      'td input[type="checkbox"]',
    )!;

    checkbox.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.selectedId()).toBe(7);

    checkbox.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.selectedId()).toBeNull();
  });
});
