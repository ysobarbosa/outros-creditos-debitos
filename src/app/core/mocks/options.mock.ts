import { Option } from '../models';

export const HISTORY_OPTIONS_MOCK: Option<number>[] = [
  { value: 1, label: 'Lançamento Manual' },
  { value: 2, label: 'Ajuste de Saldo' },
  { value: 3, label: 'Tarifa Bancária' },
  { value: 4, label: 'Estorno de Tarifa' },
];

export const BRANCH_OPTIONS_MOCK: Option<string>[] = [
  { value: '01', label: 'PA 01 - Sede' },
  { value: '02', label: 'PA 02 - Centro' },
  { value: '03', label: 'PA 03 - Zona Norte' },
];