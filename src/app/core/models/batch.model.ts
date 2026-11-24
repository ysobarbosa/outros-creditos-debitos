import { Option } from './option.model';

export const BATCH_STATUSES = ['OPEN', 'SENT', 'CONFIRMED'] as const;
export type BatchStatus = (typeof BATCH_STATUSES)[number];

export const BATCH_STATUS_LABEL: Record<BatchStatus, string> = {
  OPEN: 'Aberto',
  SENT: 'Enviado',
  CONFIRMED: 'Confirmado',
};

export const BATCH_STATUS_OPTIONS: Option<BatchStatus>[] = BATCH_STATUSES.map((s) => ({
  value: s,
  label: BATCH_STATUS_LABEL[s],
}));

export interface Batch {
  id: number;
  responsibleInstitution: string;
  institution: string;
  entryDate: Date;
  amount: number;
  entryCount: number;
  createdBy: string;
  approvedBy: string | null;
  status: BatchStatus;
  statusChangedAt: Date;
}