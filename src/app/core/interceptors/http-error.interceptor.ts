// → src/app/core/interceptors/http-error.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private toast: ToastService,
    private auth: AuthService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {

        if (err.status === 0) {
          // Erreur réseau — serveur injoignable
          this.toast.error(
            'Impossible de joindre le serveur. Vérifiez votre connexion.',
            'Connexion impossible'
          );

        } else if (err.status === 401) {
          // Session expirée — sauf pour la route de login qui gère elle-même l'erreur
          const isLoginRequest = req.url.includes('/api/auth/login') ||
                                 req.url.includes('/api/auth/register');
          if (!isLoginRequest) {
            this.auth.logout();
            this.toast.warning(
              'Votre session a expiré. Veuillez vous reconnecter.',
              'Session expirée'
            );
          }

        } else if (err.status === 403) {
          // Accès refusé — géré ici globalement, pas besoin de le répéter dans chaque composant
          this.toast.error(
            "Vous n'avez pas les droits nécessaires pour effectuer cette action.",
            'Accès refusé'
          );
        }

        // 400, 404, 409, 500 → remontés aux composants qui affichent le bon message
        return throwError(() => err);
      })
    );
  }
}
