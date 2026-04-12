// → src/app/modules/rendez-vous/components/rdv-form/rdv-form.ts
import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { RdvService } from '../../../core/services/rdv';
import { PatientService } from '../../../core/services/patient';
import { MedecinService } from '../../../core/services/medecin';
import { ToastService } from '../../../core/services/toast.service';
import { RendezVous } from '../../../shared/models/rendez-vous';
import { Patient } from '../../../shared/models/patient';
import { Medecin } from '../../../shared/models/medecin';
import { scaleIn } from '../../../shared/animations/app.animations';

@Component({
  selector: 'app-rdv-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatAutocompleteModule, MatIconModule],
  templateUrl: './rdv-form.html',
  styleUrls: ['./rdv-form.scss'],
  animations: [scaleIn]
})
export class RdvFormComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  isEdit: boolean;

  patients: Patient[] = [];
  medecins: Medecin[] = [];

  constructor(
    private fb: FormBuilder,
    private rdvService: RdvService,
    private patientService: PatientService,
    private medecinService: MedecinService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
    public dialogRef: MatDialogRef<RdvFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RendezVous | null
  ) {
    this.isEdit = !!data;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      dateHeure:    [this.data?.dateHeure    || '', Validators.required],
      statut:       [this.data?.statut       || 'EN_ATTENTE', Validators.required],
      motif:        [this.data?.motif        || '', Validators.required],
      notes:        [this.data?.notes        || ''],
      patientId:    [this.data?.patientId    || null, Validators.required],
      medecinId:    [this.data?.medecinId    || null, Validators.required],
      patientSearch:[''],
      medecinSearch:['']
    });

    this.patientService.getAll(0, 200).subscribe({
      next: p => { this.patients = p.content; this.cdr.detectChanges(); }
    });
    this.medecinService.getAll(0, 200).subscribe({
      next: m => { this.medecins = m.content; this.cdr.detectChanges(); }
    });
  }

  get f() { return this.form.controls; }

  selectPatient(patient: Patient): void {
    this.form.patchValue({
      patientId: patient.id,
      patientSearch: `${patient.prenom} ${patient.nom}`
    });
  }

  selectMedecin(medecin: Medecin): void {
    this.form.patchValue({
      medecinId: medecin.id,
      medecinSearch: `Dr. ${medecin.prenom} ${medecin.nom}`
    });
  }

  getFilteredPatients(): Patient[] {
    const s = (this.form.get('patientSearch')?.value || '').toLowerCase();
    return this.patients.filter(p =>
      `${p.prenom} ${p.nom} ${p.cin}`.toLowerCase().includes(s)
    ).slice(0, 8);
  }

  getFilteredMedecins(): Medecin[] {
    const s = (this.form.get('medecinSearch')?.value || '').toLowerCase();
    return this.medecins.filter(m =>
      `${m.prenom} ${m.nom} ${m.specialite}`.toLowerCase().includes(s)
    ).slice(0, 8);
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.loading = true;
    const { patientSearch, medecinSearch, ...rdvData } = this.form.value;
    const rdv: RendezVous = rdvData;
    const obs = this.isEdit && this.data?.id
      ? this.rdvService.update(this.data.id, rdv)
      : this.rdvService.create(rdv);

    obs.subscribe({
      next: () => {
        this.toast.success(
          this.isEdit ? 'Rendez-vous mis à jour.' : 'Rendez-vous planifié avec succès.',
          this.isEdit ? 'RDV modifié' : 'RDV créé'
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
