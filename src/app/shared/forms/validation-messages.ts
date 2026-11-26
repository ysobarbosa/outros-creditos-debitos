import { AbstractControl } from '@angular/forms';
import { POSITIVE_VALUE_ERROR } from '../validators/positive-value.validator';


export const ACCOUNT_NOT_FOUND_ERROR = 'accountNotFound';

const MESSAGES: Record<string, (details: unknown) => string> = {
  required: () => 'Campo obrigatório.',
  pattern: () => 'Formato inválido.',
  maxlength: (details) => `Máximo de ${(details as { requiredLength: number }).requiredLength} caracteres.`,
  [POSITIVE_VALUE_ERROR]: () => 'O valor deve ser maior que zero.',
  [ACCOUNT_NOT_FOUND_ERROR]: () => 'Conta corrente não encontrada.',
};

/** Returns the message for the first error of the control, or an empty string. */
export function validationMessage(control: AbstractControl): string {
  const errors = control.errors;
  if (!errors) {
    return '';
  }
  const [key, details] = Object.entries(errors)[0];
  return MESSAGES[key]?.(details) ?? 'Valor inválido.';
}