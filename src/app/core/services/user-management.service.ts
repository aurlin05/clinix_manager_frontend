// → src/app/core/services/user-management.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserItem {
  id: number;
  username: string;
  role: 'ADMIN' | 'USER' | 'MEDECIN';
  medecinId?: number;
  medecinNom?: string;
}

export interface UserCreateRequest {
  username: string;
  password: string;
  role: string;
  medecinId?: number | null;
}

export interface UserUpdateRequest {
  username: string;
  password?: string;
  role: string;
  medecinId?: number | null;
}

@Injectable({ providedIn: 'root' })
export class UserManagementService {
  private readonly API = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {}

  getAll(): Observable<UserItem[]> {
    return this.http.get<UserItem[]>(this.API);
  }

  create(req: UserCreateRequest): Observable<UserItem> {
    return this.http.post<UserItem>(this.API, req);
  }

  update(id: number, req: UserUpdateRequest): Observable<UserItem> {
    return this.http.put<UserItem>(`${this.API}/${id}`, req);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
