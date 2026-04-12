// → src/app/shared/models/rendez-vous.ts
export type StatutRDV = 'EN_ATTENTE' | 'CONFIRME' | 'ANNULE' | 'TERMINE';

export interface RendezVous {
  id?: number;
  dateHeure: string;
  statut: StatutRDV;
  motif: string;
  notes?: string;
  patientId: number;
  medecinId: number;
  patientNom?: string;
  medecinNom?: string;
}
