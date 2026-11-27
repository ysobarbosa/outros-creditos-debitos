import { Component, LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CurrencyInputDirective } from './currency-input.directive';

@Component({
  imports: [ReactiveFormsModule, CurrencyInputDirective],
  template: `<input appCurrencyInput [formControl]="control" />`,
})
class HostComponent {
  readonly control = new FormControl<number | null>(null);
}

describe('CurrencyInputDirective', () => {
  let host: HostComponent;
  let input: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [{ provide: LOCALE_ID, useValue: 'pt-BR' }],
    }).compileComponents();

    const fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    await fixture.whenStable();
    input = (fixture.nativeElement as HTMLElement).querySelector('input')!;
  });

  function type(value: string): void {
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  // Intl uses a non-breaking space after "R$"
  const normalize = (text: string) => text.replace(/\s/g, ' ');

  it('should fill from the cents and give the form a number', () => {
    type('150050');

    expect(normalize(input.value)).toBe('R$ 1.500,50');
    expect(host.control.value).toBe(1500.5);
  });

  it('should ignore anything that is not a digit', () => {
    type('-1a2,3');

    expect(host.control.value).toBe(1.23);
  });

  it('should give null when the field is cleared', () => {
    type('100');
    type('');

    expect(host.control.value).toBeNull();
    expect(input.value).toBe('');
  });

  it('should format values written by the form', () => {
    host.control.setValue(99.9);

    expect(normalize(input.value)).toBe('R$ 99,90');
  });
});
