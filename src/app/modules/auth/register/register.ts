// → src/app/modules/auth/register/register.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth';
import { ToastService } from '../../../core/services/toast.service';
import { fadeInUp } from '../../../shared/animations/app.animations';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatIconModule, MatSnackBarModule],
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
    private toast: ToastService
  ) {
    this.form = this.fb.group({
      username:        ['', Validators.required],
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
    const { confirmPassword, ...payload } = this.form.value;
    this.loading = true;
    this.auth.register(payload).subscribe({
      next: () => {
        this.toast.success('Votre compte a été créé. Connectez-vous !', 'Compte créé');
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        this.loading = false;
        this.toast.error('Ce nom d\'utilisateur est peut-être déjà pris.', 'Échec de l\'inscription');
      }
    });
  }
}
