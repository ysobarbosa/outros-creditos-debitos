import { formatCurrency } from '@angular/common';
import { Directive, ElementRef, LOCALE_ID, forwardRef, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/** Up to 13 integer digits + 2 decimals: still safe for JavaScript numbers. */
const MAX_DIGITS = 15;

@Directive({
  selector: 'input[appCurrencyInput]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CurrencyInputDirective),
      multi: true,
    },
  ],
  host: {
    type: 'text',
    inputmode: 'numeric',
    autocomplete: 'off',
    placeholder: '0.00',
    '(input)': 'onInput()',
    '(blur)': 'onTouched()',
  },
})
export class CurrencyInputDirective implements ControlValueAccessor {
  private readonly input: HTMLInputElement = inject(ElementRef).nativeElement;
  private readonly locale = inject(LOCALE_ID);

  private onChange: (value: number | null) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: number | null): void {
    this.input.value = value == null ? '' : this.format(value);
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.input.disabled = disabled;
  }

  onInput(): void {
    const digits = this.input.value.replace(/\D/g, '').slice(0, MAX_DIGITS);

    if (!digits) {
      this.input.value = '';
      this.onChange(null);
      return;
    }

    const value = Number(digits) / 100;
    this.input.value = this.format(value);
    this.onChange(value);
  }

  private format(value: number): string {
    return formatCurrency(value, this.locale, 'R$', 'BRL', '1.2-2');
  }
}