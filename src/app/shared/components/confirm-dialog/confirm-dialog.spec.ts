import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialog, ConfirmDialogData } from './confirm-dialog';

describe('ConfirmDialog', () => {
  async function setup(data: ConfirmDialogData) {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: { close: jest.fn() } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ConfirmDialog);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('should render the title, the message and the custom confirm label', async () => {
    const element = await setup({ title: 'Excluir lote', message: 'Deseja excluir?', confirmLabel: 'Excluir' });

    expect(element.querySelector('h2')?.textContent).toContain('Excluir lote');
    expect(element.textContent).toContain('Deseja excluir?');
    expect(element.textContent).toContain('Excluir');
  });

  it('should fall back to "Confirmar" when no confirm label is given', async () => {
    const element = await setup({ title: 'Título', message: 'Mensagem' });

    expect(element.textContent).toContain('Confirmar');
  });
});
