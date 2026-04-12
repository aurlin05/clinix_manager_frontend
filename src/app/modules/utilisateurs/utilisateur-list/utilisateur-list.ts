// → src/app/modules/utilisateurs/utilisateur-list/utilisateur-list.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { UserManagementService, UserItem } from '../../../core/services/user-management.service';
import { UtilisateurFormComponent } from '../utilisateur-form/utilisateur-form';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth';
import { fadeInUp, staggerList } from '../../../shared/animations/app.animations';

@Component({
  selector: 'app-utilisateur-list',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatButtonModule, MatIconModule,
    MatDialogModule, MatTooltipModule, MatProgressBarModule
  ],
  templateUrl: './utilisateur-list.html',
  styleUrls: ['./utilisateur-list.scss'],
  animations: [fadeInUp, staggerList]
})
export class UtilisateurListComponent implements OnInit {
  users: UserItem[] = [];
  loading = false;
  currentUsername: string = '';

  displayedColumns = ['avatar', 'username', 'role', 'medecin', 'actions'];

  roleConfig: Record<string, { label: string; color: string; bg: string; icon: string }> = {
    ADMIN:   { label: 'Administrateur', color: '#DC2626', bg: '#FEF2F2', icon: 'admin_panel_settings' },
    USER:    { label: 'Secrétaire',     color: '#2563EB', bg: '#EFF6FF', icon: 'badge'                },
    MEDECIN: { label: 'Médecin',        color: '#10B981', bg: '#ECFDF5', icon: 'medical_services'    },
  };

  constructor(
    private userService: UserManagementService,
    private authService: AuthService,
    private dialog: MatDialog,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentUsername = this.authService.currentUser$.value?.username || '';
    this.load();
  }

  load(): void {
    this.loading = true;
    this.userService.getAll().subscribe({
      next: users => {
        this.users = users;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  openForm(user?: UserItem): void {
    const ref = this.dialog.open(UtilisateurFormComponent, {
      width: '560px',
      data: user ? { ...user } : null,
      panelClass: 'clinix-dialog'
    });
    ref.afterClosed().subscribe(result => { if (result) this.load(); });
  }

  delete(user: UserItem): void {
    if (user.username === this.currentUsername) {
      this.toast.warning('Vous ne pouvez pas supprimer votre propre compte.', 'Action refusée');
      return;
    }
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Supprimer le compte',
        message: `Supprimer le compte de <strong>${user.username}</strong> ? Cette action est irréversible.`,
        confirmLabel: 'Supprimer',
        type: 'danger'
      }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.userService.delete(user.id).subscribe({
          next: () => {
            this.toast.success(`Compte "${user.username}" supprimé.`, 'Compte supprimé');
            this.load();
          },
          error: () => this.toast.error('Impossible de supprimer ce compte.', 'Erreur')
        });
      }
    });
  }

  getInitials(username: string): string {
    return username.substring(0, 2).toUpperCase();
  }

  isSelf(user: UserItem): boolean {
    return user.username === this.currentUsername;
  }
}
