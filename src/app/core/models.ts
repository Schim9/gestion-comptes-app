export type OperationType = 'a_venir' | 'recurrent';

export interface Operation {
  ligne: number;
  date?: string;
  libelle: string;
  compte: 'CCM' | 'Boursorama';
  montant: number;
  type?: OperationType;
}

export interface MonthData {
  exists: boolean;
  monthKey: string;
  soldeInitialCCM: number;
  soldeInitialBoursorama: number;
  soldeReelCCM: number;
  soldeReelBoursorama: number;
  soldePrevCCM: number;
  soldePrevBoursorama: number;
  operationsReelles: Operation[];
  operationsPrevisionnelles: Operation[];
}

export interface OperationRequest {
  libelle: string;
  compte: 'CCM' | 'Boursorama';
  montant: number;
  dejaDebite: boolean;
  date: string | null;
}

export interface OperationResponse {
  created: boolean;
  message: string;
}

export interface UpdateOperationRequest {
  libelle: string;
  date: string | null;
  montant: number;
  compte: 'CCM' | 'Boursorama';
}
