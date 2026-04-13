// → src/app/modules/medecins/components/medecin-list/medecin-list.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil, distinctUntilChanged } from 'rxjs/operators';
import { MedecinService } from '../../../core/services/medecin';
import { Medecin } from '../../../shared/models/medecin';
import { MedecinFormComponent } from '../medecin-form/medecin-form';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar';
import { ToastService } from '../../../core/services/toast.service';
import { GlobalSearchService } from '../../../core/services/global-search.service';
import { extractErrorMessage } from '../../../core/utils/error.utils';
import { fadeInUp, staggerList } from '../../../shared/animations/app.animations';

@Component({
  selector: 'app-medecin-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatButtonModule, MatIconModule,
    MatDialogModule, MatSnackBarModule, MatTooltipModule, MatProgressBarModule,
    PaginationComponent, SearchBarComponent
  ],
  templateUrl: './medecin-list.html',
  styleUrls: ['./medecin-list.scss'],
  animations: [fadeInUp, staggerList]
})
export class MedecinListComponent implements OnInit, OnDestroy {
  medecins: Medecin[] = [];
  filtered: Medecin[] = [];
  displayedColumns = ['avatar', 'nom', 'specialite', 'telephone', 'matricule', 'disponible', 'actions'];
  loading = false;
  totalPages = 0;
  currentPage = 0;
  keyword = '';
  specialiteFilter = '';

  specialites = ['Cardiologie', 'Dermatologie', 'Neurologie', 'Pédiatrie', 'Chirurgie', 'Gynécologie', 'Ophtalmologie', 'Orthopédie'];

  private destroy$ = new Subject<void>();

  constructor(
    private medecinService: MedecinService,
    private dialog: MatDialog,
    private toast: ToastService,
    private globalSearch: GlobalSearchService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Sync with global header search
    this.globalSearch.term$
      .pipe(takeUntil(this.destroy$), distinctUntilChanged())
      .subscribe(term => {
        if (term !== this.keyword) {
          this.keyword = term;
          this.currentPage = 0;
          this.load();
        }
      });
    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  load(): void {
    this.loading = true;
    const obs = this.keyword
      ? this.medecinService.search(this.keyword, this.currentPage)
      : this.medecinService.getAll(this.currentPage);
    obs.subscribe({
      next: page => {
        this.medecins = page.content;
        this.applySpecialiteFilter();
        this.totalPages = page.totalPages;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(extractErrorMessage(err, 'Impossible de charger les médecins.'), 'Erreur');
        this.cdr.detectChanges();
      }
    });
  }

  applySpecialiteFilter(): void {
    this.filtered = this.specialiteFilter
      ? this.medecins.filter(m => m.specialite === this.specialiteFilter)
      : [...this.medecins];
  }

  onSearch(term: string): void {
    this.keyword = term;
    this.currentPage = 0;
    this.globalSearch.setTerm(term);
    this.load();
  }

  onSpecialiteChange(): void { this.applySpecialiteFilter(); }
  onPageChange(page: number): void { this.currentPage = page; this.load(); }

  openForm(medecin?: Medecin): void {
    const ref = this.dialog.open(MedecinFormComponent, {
      width: '600px',
      data: medecin ? { ...medecin } : null,
      panelClass: 'clinix-dialog'
    });
    ref.afterClosed().subscribe(result => { if (result) this.load(); });
  }

  delete(medecin: Medecin): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Supprimer le médecin',
        message: `Voulez-vous supprimer Dr. ${medecin.prenom} ${medecin.nom} ?`,
        confirmLabel: 'Supprimer',
        type: 'danger'
      }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (confirmed && medecin.id) {
        this.medecinService.delete(medecin.id).subscribe({
          next: () => {
            this.toast.success(`Dr. ${medecin.prenom} ${medecin.nom} a été supprimé.`, 'Médecin supprimé');
            this.load();
          },
          error: (err) => this.toast.error(extractErrorMessage(err, 'Impossible de supprimer ce médecin.'), 'Erreur')
        });
      }
    });
  }

  getInitials(nom: string, prenom: string): string {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  }
}
