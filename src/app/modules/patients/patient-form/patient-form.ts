// → src/app/modules/patients/components/patient-form/patient-form.ts
import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { PatientService } from '../../../core/services/patient';
import { ToastService } from '../../../core/services/toast.service';
import { Patient } from '../../../shared/models/patient';
import { scaleIn } from '../../../shared/animations/app.animations';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatIconModule],
  templateUrl: './patient-form.html',
  styleUrls: ['./patient-form.scss'],
  animations: [scaleIn]
})
export class PatientFormComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  isEdit: boolean;

  groupesSanguins = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
    public dialogRef: MatDialogRef<PatientFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Patient | null
  ) {
    this.isEdit = !!data;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      nom:           [this.data?.nom           || '', Validators.required],
      prenom:        [this.data?.prenom        || '', Validators.required],
      dateNaissance: [this.data?.dateNaissance || '', Validators.required],
      cin:           [this.data?.cin           || '', Validators.required],
      email:         [this.data?.email         || '', [Validators.required, Validators.email]],
      telephone:     [this.data?.telephone     || '', Validators.required],
      sexe:          [this.data?.sexe          || 'M', Validators.required],
      groupeSanguin: [this.data?.groupeSanguin || '', Validators.required],
      antecedents:   [this.data?.antecedents   || '']
    });
  }

  get f() { return this.form.controls; }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.loading = true;
    const patient: Patient = this.form.value;
    const obs = this.isEdit && this.data?.id
      ? this.patientService.update(this.data.id, patient)
      : this.patientService.create(patient);

    obs.subscribe({
      next: () => {
        this.toast.success(
          this.isEdit ? 'Dossier patient mis à jour.' : 'Nouveau patient enregistré.',
          this.isEdit ? 'Patient modifié' : 'Patient créé'
        );
        this.dialogRef.close(true);
      },
      error: () => {
        this.loading = false;
        this.toast.error('Une erreur est survenue. Veuillez réessayer.', 'Erreur');
        this.cdr.detectChanges();
      }
    });
  }
}
