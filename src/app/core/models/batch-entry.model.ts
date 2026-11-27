export type EntryStatus = 'PENDING' | 'PROCESSED' | 'REJECTED';

export const ENTRY_STATUS_LABEL: Record<EntryStatus, string> = {
  PENDING: 'Pendente',
  PROCESSED: 'Processado',
  REJECTED: 'Rejeitado',
};

export interface BatchEntry {
  id: number;
  batchId: number;
  accountNumber: string;
  accountOwner: string;
  amount: number;
  historyId: number;
  isReversal: boolean;
  document: string;
  description: string | null;
  status: EntryStatus;
  /** PA (Posto de Atendimento) */
  branch: string | null;
  /** Documento CSC (simplified) */
  eventId: string | null;
  historyComplement: string;
  cscDocumentId: string | null;
}

/** Form payload: id, batchId and status are assigned by the service. */
export type NewBatchEntry = Omit<BatchEntry, 'id' | 'batchId' | 'status'>;