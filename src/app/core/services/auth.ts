// → src/app/core/services/auth.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User } from '../../shared/models/user';

interface LoginRequest { usernameOrEmail: string; password: string; }
interface RegisterRequest { username: string; email?: string; password: string; role?: string; }
interface AuthResponse { token: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = 'http://localhost:8080/api/auth';
  private readonly TOKEN_KEY = 'clinix_token';
  private readonly USER_KEY = 'clinix_user';

  currentUser$ = new BehaviorSubject<User | null>(this.getStoredUser());

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/login`, credentials).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        const payload = this.decodeToken(res.token);
        const user: User = {
          username: payload.sub,
          role: payload.role,
          medecinId: payload.medecinId ?? undefined
        };
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this.currentUser$.next(user);
      })
    );
  }

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.API}/register`, data);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser$.next(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = this.decodeToken(token);
      return payload.exp * 1000 > Date.now();
    } catch { return false; }
  }

  private getStoredUser(): User | null {
    const u = localStorage.getItem(this.USER_KEY);
    return u ? JSON.parse(u) : null;
  }

  private decodeToken(token: string): any {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  }
}
