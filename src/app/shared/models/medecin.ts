// → src/app/shared/models/medecin.ts
export interface Medecin {
  id?: number;
  nom: string;
  prenom: string;
  specialite: string;
  email: string;
  telephone: string;
  matricule: string;
  disponible: boolean;
}
