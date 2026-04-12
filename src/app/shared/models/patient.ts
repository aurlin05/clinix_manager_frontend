// → src/app/shared/models/patient.ts
export interface Patient {
  id?: number;
  nom: string;
  prenom: string;
  dateNaissance: string;
  cin: string;
  email: string;
  telephone: string;
  sexe: 'M' | 'F';
  groupeSanguin: string;
  antecedents?: string;
}
