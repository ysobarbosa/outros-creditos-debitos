import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { buildBatch } from '../../../../../testing/batch.factory';
import { provideTestDefaults, wait } from '../../../../../testing/test-providers';
import { BatchEntryService } from '../../../../core/services/batch-entry.service';
import { EntryDialog, EntryDialogData } from './entry-dialog';

describe('EntryDialog', () => {
  let fixture: ComponentFixture<EntryDialog>;
  let dialogRef: { disableClose: boolean; close: jest.Mock; backdropClick: () => Subject<MouseEvent>; keydownEvents: () => Subject<KeyboardEvent> };

  beforeEach(async () => {
    dialogRef = {
      disableClose: false,
      close: jest.fn(),
      backdropClick: () => new Subject<MouseEvent>(),
      keydownEvents: () => new Subject<KeyboardEvent>(),
    };

    await TestBed.configureTestingModule({
      imports: [EntryDialog],
      providers: [
        ...provideTestDefaults(),
        { provide: MAT_DIALOG_DATA, useValue: { batch: buildBatch({ id: 42 }) } satisfies EntryDialogData },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EntryDialog);
    await settle();
  });

  async function settle(): Promise<void> {
    await fixture.whenStable();
    await wait();
    await fixture.whenStable();
  }

  function element(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function input(name: string): HTMLInputElement {
    return element().querySelector<HTMLInputElement>(`[formcontrolname="${name}"]`)!;
  }

  function type(name: string, value: string): void {
    const field = input(name);
    field.value = value;
    field.dispatchEvent(new Event('input'));
  }

  function clickButton(label: string): void {
    Array.from(element().querySelectorAll('button'))
      .find((b) => b.textContent?.trim() === label)!
      .click();
  }

  async function searchAccount(accountNumber: string): Promise<void> {
    type('accountNumber', accountNumber);
    input('accountNumber').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    await settle();
  }

  /** Fills the fields that are hard to drive through Material selects. */
  function fillValidEntry(): void {
    const form = fixture.componentInstance['form'];
    form.patchValue({
      amount: 150.5,
      historyId: 1,
      document: 'DOC-1',
      branch: '01',
      historyComplement: 'Complemento',
    });
  }

  it('should show the owner next to the account once it is found', async () => {
    await searchAccount('10001');

    expect(input('accountOwner').value).toBe('Ana Beatriz Ferreira');
  });

  it('should flag an account that does not exist', async () => {
    await searchAccount('99999');

    expect(input('accountOwner').value).toBe('');
    expect(element().textContent).toContain('Conta corrente não encontrada.');
  });

  it('should not include an entry while the form is invalid', async () => {
    const add = jest.spyOn(TestBed.inject(BatchEntryService), 'add');

    clickButton('Incluir');
    await settle();

    expect(add).not.toHaveBeenCalled();
    expect(element().textContent).toContain('Campo obrigatório.');
  });

  it('should reject a zero amount with the custom validator message', async () => {
    await searchAccount('10001');
    fillValidEntry();
    fixture.componentInstance['form'].controls.amount.setValue(0);

    clickButton('Incluir');
    await settle();

    expect(element().textContent).toContain('O valor deve ser maior que zero.');
  });

  it('should include a valid entry, list it and clear the form', async () => {
    await searchAccount('10001');
    fillValidEntry();

    clickButton('Incluir');
    await settle();

    expect(element().querySelectorAll('app-entry-table tr[mat-row]')).toHaveLength(1);
    expect(element().textContent).toContain('Lançamentos do Lote (1)');
    expect(input('document').value).toBe('');
    // resetForm() also clears the "submitted" state, so no field shows an error
    expect(element().querySelector('mat-error')).toBeNull();
  });

  it('should keep the form filled when "Manter dados na tela" is checked', async () => {
    fixture.componentInstance['keepData'].set(true);
    await searchAccount('10001');
    fillValidEntry();

    clickButton('Incluir');
    await settle();

    expect(input('document').value).toBe('DOC-1');
  });

  it('should return the entries and the changed flag when closing', async () => {
    await searchAccount('10001');
    fillValidEntry();
    clickButton('Incluir');
    await settle();

    clickButton('Fechar');

    expect(dialogRef.close).toHaveBeenCalledWith(
      expect.objectContaining({ changed: true, entries: [expect.objectContaining({ batchId: 42, status: 'PENDING' })] }),
    );
  });
});
