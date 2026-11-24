export type StatusEntry = 'PENDING' | 'PROCESSED' | 'REJECTED';

export const ENTRY_STATUS_LABEL: Record<StatusEntry, string> = {
  PENDING: 'Pendente',
  PROCESSED: 'Processado',
  REJECTED: 'Rejeitado',
};

export interface BatchEntry {
  id: number;
  accountNumber: string;
  accountOwner: string;
  value: number;
  batchId: number;
  historyId: number;
  isReversal: boolean;
  document: string | null;
  description: string | null;
  status: StatusEntry;
  branch: string | null;    
}

export type NewEntry = Omit<BatchEntry, 'id' | 'status'>;