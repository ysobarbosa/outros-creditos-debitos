import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTestDefaults } from '../../../../../testing/test-providers';
import { BatchFilter } from '../../../../core/models';
import { BatchFilters } from './batch-filters';

describe('BatchFilters', () => {
  let fixture: ComponentFixture<BatchFilters>;
  let emitted: BatchFilter[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BatchFilters],
      providers: provideTestDefaults(),
    }).compileComponents();

    fixture = TestBed.createComponent(BatchFilters);
    emitted = [];
    fixture.componentInstance.filterApplied.subscribe((filter) => emitted.push(filter));
    await fixture.whenStable();
  });

  function element(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function type(selector: string, value: string): void {
    const input = element().querySelector<HTMLInputElement>(selector)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  function clickButton(label: string): void {
    Array.from(element().querySelectorAll('button'))
      .find((b) => b.textContent?.trim() === label)!
      .click();
  }

  it('should emit the filter typed by the user', async () => {
    type('[formgroupname="idRange"] input[formcontrolname="from"]', '1000');
    type('[formgroupname="idRange"] input[formcontrolname="to"]', '1005');

    clickButton('Pesquisar');

    expect(emitted).toHaveLength(1);
    expect(emitted[0].idRange).toEqual({ from: 1000, to: 1005 });
    expect(emitted[0].status).toBe('ALL');
  });

  it('should not emit and should show the range error when "from" is greater than "to"', async () => {
    type('[formgroupname="idRange"] input[formcontrolname="from"]', '50');
    type('[formgroupname="idRange"] input[formcontrolname="to"]', '10');

    clickButton('Pesquisar');
    await fixture.whenStable();

    expect(emitted).toHaveLength(0);
    expect(element().textContent).toContain('"Até" deve ser maior ou igual a "De".');
  });

  it('should reset the status to ALL when clearing (regression: list came back empty)', async () => {
    type('input[formcontrolname="institution"]', '0202');

    clickButton('Limpar');

    expect(emitted).toHaveLength(1);
    expect(emitted[0].status).toBe('ALL');
    expect(emitted[0].institution).toBeNull();
  });
});
