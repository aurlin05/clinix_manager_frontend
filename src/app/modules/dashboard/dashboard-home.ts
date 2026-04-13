// → src/app/modules/dashboard/dashboard-home.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PatientFormComponent } from '../patients/patient-form/patient-form';
import { MedecinFormComponent } from '../medecins/medecin-form/medecin-form';
import { RdvFormComponent } from '../rendez-vous/rdv-form/rdv-form';
import {
  Chart, ChartData, ChartOptions,
  ArcElement, Tooltip, Legend, PieController,
  BarController, BarElement, CategoryScale, LinearScale
} from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { DashboardService, DashboardStats, RdvDistribution, TopMedecin } from '../../core/services/dashboard';
import { AuthService } from '../../core/services/auth';
import { ToastService } from '../../core/services/toast.service';
import { User } from '../../shared/models/user';
import { fadeInUp } from '../../shared/animations/app.animations';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

Chart.register(ArcElement, Tooltip, Legend, PieController, BarController, BarElement, CategoryScale, LinearScale);

interface KpiCard {
  label: string; key: keyof DashboardStats;
  icon: string; gradient: string; trend: string; trendUp: boolean;
}

interface QuickAction {
  label: string; icon: string; color: string; bg: string; action: () => void;
}

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterModule, MatProgressBarModule, MatIconModule, MatDialogModule, BaseChartDirective],
  templateUrl: './dashboard-home.html',
  styleUrls: ['./dashboard-home.scss'],
  animations: [fadeInUp]
})
export class DashboardHomeComponent implements OnInit {
  stats: DashboardStats | null = null;
  rdvDistribution: RdvDistribution[] = [];
  topMedecins: TopMedecin[] = [];
  growth: number = 0;
  loading = true;
  today = new Date();
  currentUser: User | null = null;

  // ── KPIs : vue ADMIN / USER ──────────────────────────────────────────────
  adminKpis: KpiCard[] = [
    { label: 'Total Patients',  key: 'totalPatients', icon: 'people',        gradient: 'linear-gradient(135deg,#2563EB,#60A5FA)', trend: '+0%', trendUp: true  },
    { label: 'Total Médecins',  key: 'totalMedecins', icon: 'healing',       gradient: 'linear-gradient(135deg,#10B981,#34D399)', trend: '+3%',  trendUp: true  },
    { label: "RDV Aujourd'hui", key: 'rdvAujourdhui', icon: 'event',         gradient: 'linear-gradient(135deg,#8B5CF6,#A78BFA)', trend: '+8%',  trendUp: true  },
    { label: 'RDV En attente',  key: 'rdvEnAttente',  icon: 'hourglass_top', gradient: 'linear-gradient(135deg,#F59E0B,#FCD34D)', trend: '-2%',  trendUp: false },
  ];

  // ── KPIs : vue MÉDECIN ───────────────────────────────────────────────────
  medecinKpis: KpiCard[] = [
    { label: "Mes RDV aujourd'hui", key: 'rdvAujourdhui', icon: 'today',          gradient: 'linear-gradient(135deg,#0EA5E9,#38BDF8)', trend: 'Ce jour',    trendUp: true  },
    { label: 'En attente',          key: 'rdvEnAttente',  icon: 'hourglass_top',  gradient: 'linear-gradient(135deg,#F59E0B,#FCD34D)', trend: 'À traiter',  trendUp: false },
    { label: 'Confirmés',           key: 'rdvConfirmes',  icon: 'check_circle',   gradient: 'linear-gradient(135deg,#10B981,#34D399)', trend: 'Planifiés',  trendUp: true  },
    { label: 'Terminés',            key: 'rdvTermines',   icon: 'task_alt',        gradient: 'linear-gradient(135deg,#6366F1,#818CF8)', trend: 'Consultés',  trendUp: true  },
  ];

  // ── Quick actions ────────────────────────────────────────────────────────
  adminQuickActions: QuickAction[] = [
    { label: 'Nouveau patient', icon: 'person_add',     color: '#2563EB', bg: '#EFF6FF', action: () => this.openPatientForm()  },
    { label: 'Nouveau médecin', icon: 'add_circle',     color: '#10B981', bg: '#ECFDF5', action: () => this.openMedecinForm()  },
    { label: 'Nouveau RDV',     icon: 'calendar_month', color: '#8B5CF6', bg: '#F5F3FF', action: () => this.openRdvForm()      },
  ];

  medecinQuickActions: QuickAction[] = [
    { label: 'Nouveau patient', icon: 'person_add',     color: '#0EA5E9', bg: '#F0F9FF', action: () => this.openPatientForm()  },
    { label: 'Nouveau RDV',     icon: 'calendar_month', color: '#6366F1', bg: '#EEF2FF', action: () => this.openRdvForm()      },
  ];

  // ── Charts ───────────────────────────────────────────────────────────────
  pieData: ChartData<'pie'> = {
    labels: [],
    datasets: [{ data: [], backgroundColor: ['#F59E0B','#10B981','#EF4444','#94A3B8'], borderWidth: 3, borderColor: '#fff', hoverOffset: 8 }]
  };

  pieOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { padding: 16, font: { size: 12 }, usePointStyle: true, pointStyleWidth: 8 } }
    }
  };

  barData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      label: 'Rendez-vous', 
      data: [],
      backgroundColor: [],
      borderRadius: 8, 
      borderSkipped: false
    }]
  };

  barOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { beginAtZero: true, ticks: { stepSize: 2, font: { size: 11 } }, grid: { color: '#F1F5F9' } }
    }
  };

  // ── Récapitulatif statuts pour vue MÉDECIN ───────────────────────────────
  statutItems = [
    { label: 'En attente',  key: 'rdvEnAttente' as keyof DashboardStats, color: '#F59E0B', bg: '#FFFBEB', icon: 'hourglass_top'   },
    { label: 'Confirmés',   key: 'rdvConfirmes' as keyof DashboardStats, color: '#10B981', bg: '#ECFDF5', icon: 'check_circle'    },
    { label: 'Annulés',     key: 'rdvAnnules'  as keyof DashboardStats,  color: '#EF4444', bg: '#FEF2F2', icon: 'cancel'          },
    { label: 'Terminés',    key: 'rdvTermines'  as keyof DashboardStats, color: '#6366F1', bg: '#EEF2FF', icon: 'task_alt'        },
  ];

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser$.value;
    this.loading = true;

    // Charger toutes les données en parallèle avec gestion d'erreur robuste
    forkJoin({
      stats: this.dashboardService.getStats().pipe(
        catchError(() => of(null))
      ),
      distribution: this.dashboardService.getRdvDistribution().pipe(
        catchError(() => of([]))
      ),
      topMedecins: this.dashboardService.getTopMedecins().pipe(
        catchError(() => of([]))
      ),
      growth: this.dashboardService.getGrowth().pipe(
        catchError(() => of(0))
      )
    }).subscribe({
      next: (results) => {
        // Mettre à jour les stats
        if (results.stats) {
          this.stats = results.stats;
        }
        if (results.distribution) {
          this.rdvDistribution = results.distribution;
        }
        if (results.topMedecins) {
          this.topMedecins = results.topMedecins;
        }
        if (results.growth !== undefined) {
          this.growth = results.growth;
        }

        // Mettre à jour les KPI et les charts
        this.updateAllKpis();
        this.updatePieChart();
        this.updateBarChart();

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.toast.error('Impossible de charger le tableau de bord.', 'Erreur');
        this.cdr.detectChanges();
      }
    });
  }

  private updateAllKpis(): void {
    if (!this.stats) {
      return;
    }

    // Mettre à jour les KPI Admin
    const growthRounded = Math.round(this.growth);
    const trendUp = this.growth >= 0;
    const growthLabel = `${trendUp ? '+' : ''}${growthRounded}%`;
    
    this.adminKpis = [
      {
        label: 'Total Patients',
        key: 'totalPatients',
        icon: 'people',
        gradient: 'linear-gradient(135deg,#2563EB,#60A5FA)',
        trend: growthLabel,
        trendUp
      },
      {
        label: 'Total Médecins',
        key: 'totalMedecins',
        icon: 'healing',
        gradient: 'linear-gradient(135deg,#10B981,#34D399)',
        trend: growthLabel,
        trendUp
      },
      {
        label: "RDV Aujourd'hui",
        key: 'rdvAujourdhui',
        icon: 'event',
        gradient: 'linear-gradient(135deg,#8B5CF6,#A78BFA)',
        trend: growthLabel,
        trendUp
      },
      {
        label: 'RDV En attente',
        key: 'rdvEnAttente',
        icon: 'hourglass_top',
        gradient: 'linear-gradient(135deg,#F59E0B,#FCD34D)',
        trend: growthLabel,
        trendUp
      }
    ];

    // Mettre à jour les KPI Médecin
    this.medecinKpis = [
      {
        label: "Mes RDV aujourd'hui",
        key: 'rdvAujourdhui',
        icon: 'today',
        gradient: 'linear-gradient(135deg,#0EA5E9,#38BDF8)',
        trend: `${this.stats.rdvAujourdhui}`,
        trendUp: true
      },
      {
        label: 'En attente',
        key: 'rdvEnAttente',
        icon: 'hourglass_top',
        gradient: 'linear-gradient(135deg,#F59E0B,#FCD34D)',
        trend: `${this.stats.rdvEnAttente}`,
        trendUp: false
      },
      {
        label: 'Confirmés',
        key: 'rdvConfirmes',
        icon: 'check_circle',
        gradient: 'linear-gradient(135deg,#10B981,#34D399)',
        trend: `${this.stats.rdvConfirmes}`,
        trendUp: true
      },
      {
        label: 'Terminés',
        key: 'rdvTermines',
        icon: 'task_alt',
        gradient: 'linear-gradient(135deg,#6366F1,#818CF8)',
        trend: `${this.stats.rdvTermines}`,
        trendUp: true
      }
    ];
  }

  private updatePieChart(): void {
    // Si on a des données depuis l'API (rdvDistribution peuplé et valide)
    if (this.rdvDistribution && this.rdvDistribution.length > 0 && 
        !this.rdvDistribution[0].statut.includes('Aucune')) {
      const labels = this.rdvDistribution.map(d => this.translateStatut(d.statut));
      const data = this.rdvDistribution.map(d => d.count);
      const colors = ['#F59E0B', '#10B981', '#EF4444', '#94A3B8'];
      
      this.pieData = {
        labels: [...labels],
        datasets: [{
          data: [...data],
          backgroundColor: colors.slice(0, data.length),
          borderWidth: 3,
          borderColor: '#fff',
          hoverOffset: 8
        }]
      };
    } else {
      // Pas de données - afficher le message "aucune donnée disponible"
      this.pieData = {
        labels: ['Aucune donnée disponible'],
        datasets: [{
          data: [1],
          backgroundColor: ['#D1D5DB'],
          borderWidth: 3,
          borderColor: '#fff',
          hoverOffset: 8
        }]
      };
    }
  }

  private updateBarChart(): void {
    if (this.topMedecins && this.topMedecins.length > 0) {
      const labels = this.topMedecins.map(m => `Dr. ${m.prenom} ${m.nom}`);
      const data = this.topMedecins.map(m => m.nombreRdv);
      const colors = [
        'rgba(37,99,235,0.85)',
        'rgba(37,99,235,0.7)',
        'rgba(37,99,235,0.55)',
        'rgba(37,99,235,0.4)',
        'rgba(37,99,235,0.28)'
      ];
      
      this.barData = {
        labels: [...labels],
        datasets: [{
          label: 'Rendez-vous',
          data: [...data],
          backgroundColor: colors.slice(0, data.length),
          borderRadius: 8,
          borderSkipped: false
        }]
      };
    } else if (!this.topMedecins || this.topMedecins.length === 0) {
      // Message "aucune donnée disponible"
      this.barData = {
        labels: ['Aucune donnée disponible'],
        datasets: [{
          label: 'Rendez-vous',
          data: [1],
          backgroundColor: ['rgba(209,213,219,0.5)'],
          borderRadius: 8,
          borderSkipped: false
        }]
      };
    }
  }

  private translateStatut(statut: string): string {
    const map: { [key: string]: string } = {
      'EN_ATTENTE': 'En attente',
      'CONFIRME': 'Confirmés',
      'ANNULE': 'Annulés',
      'TERMINE': 'Terminés'
    };
    return map[statut] || statut;
  }

  get isMedecin(): boolean { return this.currentUser?.role === 'MEDECIN'; }

  get kpis(): KpiCard[]             { return this.isMedecin ? this.medecinKpis    : this.adminKpis;         }
  get quickActions(): QuickAction[] { return this.isMedecin ? this.medecinQuickActions : this.adminQuickActions; }

  get displayName(): string {
    const u = this.currentUser?.username || '';
    return this.isMedecin ? `Dr. ${u}` : u;
  }

  openPatientForm(): void {
    this.dialog.open(PatientFormComponent, { width: '620px', panelClass: 'clinix-dialog', data: null });
  }

  openMedecinForm(): void {
    this.dialog.open(MedecinFormComponent, { width: '620px', panelClass: 'clinix-dialog', data: null });
  }

  openRdvForm(): void {
    this.dialog.open(RdvFormComponent, { width: '640px', panelClass: 'clinix-dialog', data: null });
  }

  getValue(key: keyof DashboardStats): number {
    if (!this.stats) return 0;
    const val = this.stats[key];
    return typeof val === 'number' ? val : (Number(val) || 0);
  }

  get totalRdv(): number {
    if (!this.stats) return 0;
    return this.getValue('rdvEnAttente') + this.getValue('rdvConfirmes')
         + this.getValue('rdvAnnules')  + this.getValue('rdvTermines');
  }

  getPercent(key: keyof DashboardStats): number {
    const total = this.totalRdv;
    if (total === 0) return 0;
    return Math.round((this.getValue(key) / total) * 100);
  }

  get greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }
}
