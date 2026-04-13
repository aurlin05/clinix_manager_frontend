// → src/app/modules/auth/register/register.ts
import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth';
import { ToastService } from '../../../core/services/toast.service';
import { extractErrorMessage } from '../../../core/utils/error.utils';
import { fadeInUp } from '../../../shared/animations/app.animations';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatIconModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
  animations: [fadeInUp]
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  hidePassword = true;

  features = [
    'Accès complet selon votre rôle',
    'Interface intuitive et responsive',
    'Données sécurisées et confidentielles',
  ];

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      username:        ['', [Validators.required, Validators.minLength(3)]],
      email:           ['', [Validators.email]],
      password:        ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      role:            ['ADMIN']
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const pw  = form.get('password');
    const cpw = form.get('confirmPassword');
    if (pw && cpw && pw.value !== cpw.value) {
      cpw.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { confirmPassword, email, ...rest } = this.form.value;
    const payload = email?.trim() ? { ...rest, email: email.trim() } : rest;
    this.loading = true;
    this.auth.register(payload).pipe(
      finalize(() => { this.loading = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: () => {
        this.toast.success('Votre compte a été créé. Connectez-vous !', 'Compte créé');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        const msg = extractErrorMessage(err, 'Ce nom d\'utilisateur est déjà pris.');
        this.toast.error(msg, 'Échec de l\'inscription');
      }
    });
  }
}
