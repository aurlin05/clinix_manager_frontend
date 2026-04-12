// → src/app/modules/utilisateurs/utilisateur-form/utilisateur-form.ts
import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { UserManagementService, UserItem } from '../../../core/services/user-management.service';
import { MedecinService } from '../../../core/services/medecin';
import { Medecin } from '../../../shared/models/medecin';
import { ToastService } from '../../../core/services/toast.service';
import { scaleIn } from '../../../shared/animations/app.animations';

@Component({
  selector: 'app-utilisateur-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatIconModule],
  templateUrl: './utilisateur-form.html',
  styleUrls: ['./utilisateur-form.scss'],
  animations: [scaleIn]
})
export class UtilisateurFormComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  isEdit: boolean;
  medecins: Medecin[] = [];

  roles = [
    { value: 'ADMIN',   label: 'Administrateur', icon: 'admin_panel_settings', color: '#DC2626' },
    { value: 'USER',    label: 'Secrétaire',      icon: 'badge',                color: '#2563EB' },
    { value: 'MEDECIN', label: 'Médecin',          icon: 'medical_services',    color: '#10B981' },
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserManagementService,
    private medecinService: MedecinService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
    public dialogRef: MatDialogRef<UtilisateurFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserItem | null
  ) {
    this.isEdit = !!data;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      username:  [this.data?.username || '', [Validators.required, Validators.minLength(3)]],
      password:  ['', this.isEdit ? [] : [Validators.required, Validators.minLength(6)]],
      role:      [this.data?.role || 'USER', Validators.required],
      medecinId: [this.data?.medecinId || null]
    });

    // Charger la liste des médecins pour le sélecteur
    this.medecinService.getAll(0, 200).subscribe({
      next: page => { this.medecins = page.content; this.cdr.detectChanges(); }
    });

    // Réagir aux changements de rôle
    this.form.get('role')?.valueChanges.subscribe(role => {
      const ctrl = this.form.get('medecinId');
      if (role === 'MEDECIN') {
        ctrl?.setValidators(Validators.required);
      } else {
        ctrl?.clearValidators();
        ctrl?.setValue(null);
      }
      ctrl?.updateValueAndValidity();
    });
  }

  get f() { return this.form.controls; }
  get isMedecin(): boolean { return this.form.get('role')?.value === 'MEDECIN'; }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.loading = true;

    const { username, password, role, medecinId } = this.form.value;
    const payload: any = { username, role, medecinId: role === 'MEDECIN' ? medecinId : null };
    if (password) payload.password = password;

    const obs = this.isEdit && this.data?.id
      ? this.userService.update(this.data.id, payload)
      : this.userService.create(payload);

    obs.subscribe({
      next: () => {
        this.toast.success(
          this.isEdit ? 'Compte mis à jour.' : 'Compte créé avec succès.',
          this.isEdit ? 'Utilisateur modifié' : 'Utilisateur créé'
        );
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loading = false;
        const msg = err?.error?.message || 'Une erreur est survenue.';
        this.toast.error(msg, 'Erreur');
        this.cdr.detectChanges();
      }
    });
  }
}
