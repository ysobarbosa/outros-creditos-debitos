import { ComponentFixture, TestBed } from '@angular/core/testing';
import { buildBatch } from '../../../../../testing/batch.factory';
import { Batch } from '../../../../core/models';
import { BatchActions } from './batch-actions';

describe('BatchActions', () => {
  let fixture: ComponentFixture<BatchActions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [BatchActions] }).compileComponents();
    fixture = TestBed.createComponent(BatchActions);
  });

  async function render(selected: Batch[], busy = false): Promise<void> {
    fixture.componentRef.setInput('selected', selected);
    fixture.componentRef.setInput('busy', busy);
    await fixture.whenStable();
  }

  function button(label: string): HTMLButtonElement {
    const buttons = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'));
    return buttons.find((b) => b.textContent?.trim() === label)!;
  }

  const SINGLE_ACTIONS = ['Alterar', 'Excluir', 'Visualizar'];

  it('should only enable "Incluir" when nothing is selected', async () => {
    await render([]);

    expect(button('Incluir').disabled).toBe(false);
    for (const label of [...SINGLE_ACTIONS, 'Enviar', 'Confirmar', 'Visualizar Justificativa']) {
      expect(button(label).disabled).toBe(true);
    }
  });

  it('should enable Alterar/Excluir/Visualizar with exactly one batch selected', async () => {
    await render([buildBatch()]);

    for (const label of SINGLE_ACTIONS) {
      expect(button(label).disabled).toBe(false);
    }
  });

  it('should disable Alterar/Excluir/Visualizar with more than one batch selected', async () => {
    await render([buildBatch({ id: 1 }), buildBatch({ id: 2 })]);

    for (const label of SINGLE_ACTIONS) {
      expect(button(label).disabled).toBe(true);
    }
  });

  it('should only allow sending when every selected batch is open', async () => {
    await render([buildBatch({ id: 1, status: 'OPEN' }), buildBatch({ id: 2, status: 'OPEN' })]);
    expect(button('Enviar').disabled).toBe(false);
    expect(button('Confirmar').disabled).toBe(true);

    await render([buildBatch({ id: 1, status: 'OPEN' }), buildBatch({ id: 2, status: 'SENT' })]);
    expect(button('Enviar').disabled).toBe(true);
  });

  it('should only allow confirming when every selected batch was sent', async () => {
    await render([buildBatch({ status: 'SENT' })]);

    expect(button('Confirmar').disabled).toBe(false);
    expect(button('Enviar').disabled).toBe(true);
  });

  it('should disable every action while busy', async () => {
    await render([buildBatch()], true);

    expect(button('Incluir').disabled).toBe(true);
    expect(button('Alterar').disabled).toBe(true);
  });

  it('should emit the clicked action', async () => {
    await render([buildBatch()]);
    const emitted: string[] = [];
    fixture.componentInstance.actionTriggered.subscribe((action) => emitted.push(action));

    button('Excluir').click();

    expect(emitted).toEqual(['delete']);
  });
});
