// → src/app/app.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { filter } from 'rxjs/operators';
import { AuthService } from './core/services/auth';
import { User } from './shared/models/user';
import { ToastContainerComponent } from './shared/components/toast/toast-container';

// Navigation items with allowed roles (empty = all roles)
interface NavItem {
  path: string;
  icon: string;
  label: string;
  roles?: string[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule, MatTooltipModule, ToastContainerComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent implements OnInit {
  isLoggedIn = false;
  sidebarCollapsed = false;
  sidebarOpen = false;
  currentUser: User | null = null;
  currentPath = '/dashboard';
  notifCount = 3;

  private allNavItems: NavItem[] = [
    { path: '/dashboard',   icon: 'dashboard',        label: 'Tableau de bord' },
    { path: '/patients',    icon: 'people',            label: 'Patients'        },
    { path: '/medecins',      icon: 'medical_services',  label: 'Médecins',     roles: ['ADMIN'] },
    { path: '/utilisateurs',  icon: 'manage_accounts',   label: 'Utilisateurs', roles: ['ADMIN'] },
    { path: '/rendez-vous', icon: 'event',             label: 'Rendez-vous'     }
  ];

  private routeMeta: Record<string, { label: string; subtitle: string; icon: string }> = {
    '/dashboard':   { label: 'Tableau de bord', subtitle: 'Vue d\'ensemble de la clinique', icon: 'dashboard'       },
    '/patients':    { label: 'Patients',         subtitle: 'Gestion des dossiers patients', icon: 'people'          },
    '/medecins':    { label: 'Médecins',          subtitle: 'Corps médical de la clinique',  icon: 'medical_services'},
    '/rendez-vous':   { label: 'Rendez-vous',   subtitle: 'Planning des consultations',      icon: 'event'           },
    '/utilisateurs':  { label: 'Utilisateurs', subtitle: 'Comptes, rôles et permissions',   icon: 'manage_accounts' }
  };

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.auth.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isLoggedIn = !!user;
    });

    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      this.currentPath = '/' + e.urlAfterRedirects.split('/')[1];
    });
  }

  /** Nav items filtered by current user role */
  get navItems(): NavItem[] {
    const role = this.currentUser?.role || '';
    return this.allNavItems.filter(item =>
      !item.roles || item.roles.includes(role)
    );
  }

  get currentRoute(): string {
    return this.routeMeta[this.currentPath]?.label || '';
  }

  get routeSubtitle(): string {
    return this.routeMeta[this.currentPath]?.subtitle || '';
  }

  get routeIcon(): string {
    return this.routeMeta[this.currentPath]?.icon || 'circle';
  }

  get userInitials(): string {
    const u = this.currentUser?.username || '';
    return u.substring(0, 2).toUpperCase();
  }

  get roleLabel(): string {
    const map: Record<string, string> = {
      ADMIN:   'Administrateur',
      MEDECIN: 'Médecin',
      USER:    'Secrétaire'
    };
    return map[this.currentUser?.role || ''] || this.currentUser?.role || '';
  }

  get isAuthRoute(): boolean {
    return this.router.url.startsWith('/auth');
  }

  toggleSidebar(): void {
    if (window.innerWidth < 1024) {
      this.sidebarOpen = !this.sidebarOpen;
    } else {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    }
  }

  logout(): void { this.auth.logout(); }
}
