// → src/app/modules/patients/components/patient-list/patient-list.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { PatientService } from '../../../core/services/patient';
import { Patient } from '../../../shared/models/patient';
import { PatientFormComponent } from '../patient-form/patient-form';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar';
import { ToastService } from '../../../core/services/toast.service';
import { fadeInUp, staggerList } from '../../../shared/animations/app.animations';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatButtonModule, MatIconModule,
    MatDialogModule, MatSnackBarModule, MatTooltipModule, MatProgressBarModule,
    PaginationComponent, SearchBarComponent
  ],
  templateUrl: './patient-list.html',
  styleUrls: ['./patient-list.scss'],
  animations: [fadeInUp, staggerList]
})
export class PatientListComponent implements OnInit {
  patients: Patient[] = [];
  displayedColumns = ['avatar', 'nom', 'cin', 'telephone', 'sexe', 'groupeSanguin', 'actions'];
  loading = false;
  totalPages = 0;
  currentPage = 0;
  keyword = '';

  constructor(
    private patientService: PatientService,
    private dialog: MatDialog,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    const obs = this.keyword
      ? this.patientService.search(this.keyword, this.currentPage)
      : this.patientService.getAll(this.currentPage);
    obs.subscribe({
      next: page => {
        this.patients = page.content;
        this.totalPages = page.totalPages;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  onSearch(term: string): void { this.keyword = term; this.currentPage = 0; this.load(); }
  onPageChange(page: number): void { this.currentPage = page; this.load(); }

  openForm(patient?: Patient): void {
    const ref = this.dialog.open(PatientFormComponent, {
      width: '600px',
      data: patient ? { ...patient } : null,
      panelClass: 'clinix-dialog'
    });
    ref.afterClosed().subscribe(result => { if (result) this.load(); });
  }

  delete(patient: Patient): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Supprimer le patient',
        message: `Voulez-vous supprimer ${patient.prenom} ${patient.nom} ?`,
        confirmLabel: 'Supprimer',
        type: 'danger'
      }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (confirmed && patient.id) {
        this.patientService.delete(patient.id).subscribe({
          next: () => {
            this.toast.success(`${patient.prenom} ${patient.nom} a été supprimé.`, 'Patient supprimé');
            this.load();
          },
          error: () => this.toast.error('Impossible de supprimer ce patient.', 'Erreur')
        });
      }
    });
  }

  getInitials(nom: string, prenom: string): string {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  }
}
