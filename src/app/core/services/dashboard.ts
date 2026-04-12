// → src/app/core/services/dashboard.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardStats {
  totalPatients: number;
  totalMedecins: number;
  rdvAujourdhui: number;
  rdvEnAttente:  number;
  rdvConfirmes:  number;
  rdvAnnules:    number;
  rdvTermines:   number;
}

export interface RdvDistribution {
  statut: string;
  count: number;
  percentage: number;
}

export interface TopMedecin {
  id: number;
  nom: string;
  prenom: string;
  specialite: string;
  nombreRdv: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly API = 'http://localhost:8080/api/dashboard';

  constructor(private http: HttpClient) {}

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.API}/stats`);
  }

  getRdvDistribution(): Observable<RdvDistribution[]> {
    return this.http.get<RdvDistribution[]>(`${this.API}/rdv-distribution`);
  }

  getTopMedecins(): Observable<TopMedecin[]> {
    return this.http.get<TopMedecin[]>(`${this.API}/top-medecins`);
  }

  getGrowth(): Observable<number> {
    return this.http.get<number>(`${this.API}/growth`);
  }
}
