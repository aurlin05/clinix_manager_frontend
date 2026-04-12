// → src/app/core/services/medecin.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Medecin } from '../../shared/models/medecin';
import { Page } from '../../shared/models/page';

@Injectable({ providedIn: 'root' })
export class MedecinService {
  private readonly API = 'http://localhost:8080/api/medecins';

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 10): Observable<Page<Medecin>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<Medecin>>(this.API, { params });
  }

  search(keyword: string, page = 0, size = 10): Observable<Page<Medecin>> {
    const params = new HttpParams()
      .set('keyword', keyword).set('page', page).set('size', size);
    return this.http.get<Page<Medecin>>(`${this.API}/search`, { params });
  }

  getById(id: number): Observable<Medecin> {
    return this.http.get<Medecin>(`${this.API}/${id}`);
  }

  create(medecin: Medecin): Observable<Medecin> {
    return this.http.post<Medecin>(this.API, medecin);
  }

  update(id: number, medecin: Medecin): Observable<Medecin> {
    return this.http.put<Medecin>(`${this.API}/${id}`, medecin);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
