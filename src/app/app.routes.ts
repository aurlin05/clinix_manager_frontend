// → src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./modules/auth/login/login').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./modules/auth/register/register').then(m => m.RegisterComponent)
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./modules/dashboard/dashboard-home').then(m => m.DashboardHomeComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'patients',
    loadComponent: () => import('./modules/patients/patient-list/patient-list').then(m => m.PatientListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'medecins',
    loadComponent: () => import('./modules/medecins/medecin-list/medecin-list').then(m => m.MedecinListComponent),
    canActivate: [AuthGuard, roleGuard(['ADMIN'])]
  },
  {
    path: 'utilisateurs',
    loadComponent: () => import('./modules/utilisateurs/utilisateur-list/utilisateur-list').then(m => m.UtilisateurListComponent),
    canActivate: [AuthGuard, roleGuard(['ADMIN'])]
  },
  {
    path: 'rendez-vous',
    loadComponent: () => import('./modules/rendez-vous/rdv-list/rdv-list').then(m => m.RdvListComponent),
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: 'dashboard' }
];
