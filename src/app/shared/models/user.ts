// → src/app/shared/models/user.ts
export type UserRole = 'ADMIN' | 'USER' | 'MEDECIN';

export interface User {
  id?: number;
  username: string;
  role: UserRole;
  medecinId?: number;
}
