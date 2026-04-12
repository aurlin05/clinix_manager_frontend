// → src/app/modules/rendez-vous/components/rdv-list/rdv-list.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RdvService } from '../../../core/services/rdv';
import { RendezVous, StatutRDV } from '../../../shared/models/rendez-vous';
import { RdvFormComponent } from '../rdv-form/rdv-form';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { ToastService } from '../../../core/services/toast.service';
import { fadeInUp, staggerList } from '../../../shared/animations/app.animations';

@Component({
  selector: 'app-rdv-list',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatButtonModule, MatIconModule,
    MatDialogModule, MatSnackBarModule, MatTooltipModule, MatProgressBarModule,
    PaginationComponent
  ],
  templateUrl: './rdv-list.html',
  styleUrls: ['./rdv-list.scss'],
  animations: [fadeInUp, staggerList]
})
export class RdvListComponent implements OnInit {
  rdvs: RendezVous[] = [];
  displayedColumns = ['dateHeure', 'patient', 'medecin', 'motif', 'statut', 'actions'];
  loading = false;
  totalPages = 0;
  currentPage = 0;
  statutFilter: StatutRDV | '' = '';

  statuts: { value: StatutRDV | '', label: string }[] = [
    { value: '',           label: 'Tous'       },
    { value: 'EN_ATTENTE', label: 'En attente' },
    { value: 'CONFIRME',   label: 'Confirmé'   },
    { value: 'ANNULE',     label: 'Annulé'     },
    { value: 'TERMINE',    label: 'Terminé'    }
  ];

  constructor(
    private rdvService: RdvService,
    private dialog: MatDialog,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.rdvService.getAll(this.currentPage, 10, this.statutFilter || undefined).subscribe({
      next: page => {
        this.rdvs = page.content;
        this.totalPages = page.totalPages;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  onStatutChange(statut: StatutRDV | ''): void { this.statutFilter = statut; this.currentPage = 0; this.load(); }
  onPageChange(page: number): void { this.currentPage = page; this.load(); }

  openForm(rdv?: RendezVous): void {
    const ref = this.dialog.open(RdvFormComponent, {
      width: '600px',
      data: rdv ? { ...rdv } : null,
      panelClass: 'clinix-dialog'
    });
    ref.afterClosed().subscribe(result => { if (result) this.load(); });
  }

  delete(rdv: RendezVous): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Supprimer le rendez-vous',
        message: 'Voulez-vous supprimer ce rendez-vous ?',
        confirmLabel: 'Supprimer',
        type: 'danger'
      }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (confirmed && rdv.id) {
        this.rdvService.delete(rdv.id).subscribe({
          next: () => {
            this.toast.success('Le rendez-vous a été supprimé.', 'RDV supprimé');
            this.load();
          },
          error: () => this.toast.error('Impossible de supprimer ce rendez-vous.', 'Erreur')
        });
      }
    });
  }

  getStatutClass(statut: StatutRDV): string {
    const map: Record<StatutRDV, string> = {
      EN_ATTENTE: 'badge-yellow',
      CONFIRME:   'badge-green',
      ANNULE:     'badge-red',
      TERMINE:    'badge-gray'
    };
    return map[statut];
  }

  getStatutLabel(statut: StatutRDV): string {
    const map: Record<StatutRDV, string> = {
      EN_ATTENTE: 'En attente',
      CONFIRME:   'Confirmé',
      ANNULE:     'Annulé',
      TERMINE:    'Terminé'
    };
    return map[statut];
  }
}
