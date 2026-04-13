// → src/app/modules/auth/login/login.ts
import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { finalize } from 'rxjs/operators';
import { fadeInUp } from '../../../shared/animations/app.animations';
import { AuthService } from '../../../core/services/auth';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatIconModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  animations: [fadeInUp]
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  hidePassword = true;

  features = [
    'Gestion complète des dossiers patients',
    'Planification intelligente des rendez-vous',
    'Tableau de bord avec statistiques en temps réel',
  ];

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      usernameOrEmail: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;

    this.auth.login(this.form.value).pipe(
      finalize(() => { this.loading = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: () => {
        this.toast.success('Bienvenue sur Clinix Manager !', 'Connexion réussie');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        const msg = err?.error?.message || 'Nom d\'utilisateur ou mot de passe incorrect.';
        this.toast.error(msg, 'Connexion échouée');
      }
    });
  }
}
