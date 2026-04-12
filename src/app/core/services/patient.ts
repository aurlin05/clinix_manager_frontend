// → src/app/core/services/patient.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Patient } from '../../shared/models/patient';
import { Page } from '../../shared/models/page';

@Injectable({ providedIn: 'root' })
export class PatientService {
  private readonly API = 'http://localhost:8080/api/patients';

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 10, sortBy = 'nom'): Observable<Page<Patient>> {
    const params = new HttpParams()
      .set('page', page).set('size', size).set('sortBy', sortBy);
    return this.http.get<Page<Patient>>(this.API, { params });
  }

  search(keyword: string, page = 0, size = 10): Observable<Page<Patient>> {
    const params = new HttpParams()
      .set('keyword', keyword).set('page', page).set('size', size);
    return this.http.get<Page<Patient>>(`${this.API}/search`, { params });
  }

  getById(id: number): Observable<Patient> {
    return this.http.get<Patient>(`${this.API}/${id}`);
  }

  create(patient: Patient): Observable<Patient> {
    return this.http.post<Patient>(this.API, patient);
  }

  update(id: number, patient: Patient): Observable<Patient> {
    return this.http.put<Patient>(`${this.API}/${id}`, patient);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
