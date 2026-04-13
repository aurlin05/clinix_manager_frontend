// → src/app/modules/medecins/components/medecin-form/medecin-form.ts
import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MedecinService } from '../../../core/services/medecin';
import { ToastService } from '../../../core/services/toast.service';
import { Medecin } from '../../../shared/models/medecin';
import { extractErrorMessage } from '../../../core/utils/error.utils';
import { scaleIn } from '../../../shared/animations/app.animations';

@Component({
  selector: 'app-medecin-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatIconModule],
  templateUrl: './medecin-form.html',
  styleUrls: ['./medecin-form.scss'],
  animations: [scaleIn]
})
export class MedecinFormComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  isEdit: boolean;
  createAccount = false;

  specialites = [
    'Médecine générale', 'Cardiologie', 'Dermatologie', 'Neurologie',
    'Pédiatrie', 'Chirurgie', 'Gynécologie', 'Ophtalmologie', 'Orthopédie',
    'Psychiatrie', 'Radiologie', 'Rhumatologie', 'Urologie'
  ];

  constructor(
    private fb: FormBuilder,
    private medecinService: MedecinService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
    public dialogRef: MatDialogRef<MedecinFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Medecin | null
  ) {
    this.isEdit = !!data;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      nom:        [this.data?.nom        || '', Validators.required],
      prenom:     [this.data?.prenom     || '', Validators.required],
      specialite: [this.data?.specialite || '', Validators.required],
      email:      [this.data?.email      || '', [Validators.required, Validators.email]],
      telephone:  [this.data?.telephone  || '', Validators.required],
      matricule:  [this.data?.matricule  || '', Validators.required],
      disponible: [this.data?.disponible ?? true],
      username:   [''],
      password:   ['']
    });
  }

  toggleAccount(): void {
    this.createAccount = !this.createAccount;
    const u = this.form.get('username');
    const p = this.form.get('password');
    if (this.createAccount) {
      u?.setValidators([Validators.required, Validators.minLength(3)]);
      p?.setValidators([Validators.required, Validators.minLength(6)]);
    } else {
      u?.clearValidators(); u?.setValue('');
      p?.clearValidators(); p?.setValue('');
    }
    u?.updateValueAndValidity();
    p?.updateValueAndValidity();
  }

  get f() { return this.form.controls; }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.loading = true;
    const { username, password, ...medecinData } = this.form.value;
    const medecin: any = { ...medecinData };
    if (this.createAccount && username) {
      medecin.username = username;
      medecin.password = password;
    }
    const obs = this.isEdit && this.data?.id
      ? this.medecinService.update(this.data.id, medecin as Medecin)
      : this.medecinService.create(medecin as Medecin);

    obs.subscribe({
      next: () => {
        this.toast.success(
          this.isEdit ? 'Profil médecin mis à jour.' : 'Médecin ajouté au corps médical.',
          this.isEdit ? 'Médecin modifié' : 'Médecin créé'
        );
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(extractErrorMessage(err), 'Erreur');
        this.cdr.detectChanges();
      }
    });
  }
}
