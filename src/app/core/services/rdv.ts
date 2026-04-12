// → src/app/core/services/rdv.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RendezVous, StatutRDV } from '../../shared/models/rendez-vous';
import { Page } from '../../shared/models/page';

@Injectable({ providedIn: 'root' })
export class RdvService {
  private readonly API = 'http://localhost:8080/api/rdv';

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 10, statut?: StatutRDV, medecinId?: number): Observable<Page<RendezVous>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (statut) params = params.set('statut', statut);
    if (medecinId) params = params.set('medecinId', medecinId);
    return this.http.get<Page<RendezVous>>(this.API, { params });
  }

  getById(id: number): Observable<RendezVous> {
    return this.http.get<RendezVous>(`${this.API}/${id}`);
  }

  create(rdv: RendezVous): Observable<RendezVous> {
    return this.http.post<RendezVous>(this.API, rdv);
  }

  update(id: number, rdv: RendezVous): Observable<RendezVous> {
    return this.http.put<RendezVous>(`${this.API}/${id}`, rdv);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
