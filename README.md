# Clinix Manager — Frontend

Interface web pour le système de gestion de clinique médicale. Projet PFE Master 2025-2026.

## Stack technique

| Technologie | Version |
|---|---|
| Angular | 21 |
| Angular Material | 21 |
| TypeScript | 5.9 |
| Tailwind CSS | 3.4 |
| RxJS | 7+ |

## Fonctionnalités

- Authentification JWT avec persistance localStorage
- Contrôle d'accès par rôle (`ADMIN`, `MEDECIN`, `USER`)
- Sidebar responsive avec collapse desktop / drawer mobile
- **Recherche globale** dans le header (Ctrl+K) synchronisée sur toutes les pages
- CRUD complet : patients, médecins, rendez-vous, utilisateurs
- Dashboard avec statistiques, graphiques et top médecins
- Confirmation avant suppression et avant déconnexion (dialog Material)
- Notifications toast animées
- Pagination serveur

## Structure du projet

```
src/app/
├── core/
│   ├── guards/
│   │   ├── auth-guard.ts          # Redirige vers /auth/login si non connecté
│   │   └── role-guard.ts          # Bloque selon le rôle (ex: ADMIN uniquement)
│   ├── interceptors/
│   │   └── jwt-interceptor.ts     # Injecte Authorization: Bearer <token>
│   └── services/
│       ├── auth.ts                # Login, logout, token, currentUser$
│       ├── patient.ts             # CRUD + recherche patients
│       ├── medecin.ts             # CRUD + recherche médecins
│       ├── rdv.ts                 # CRUD rendez-vous avec filtre statut
│       ├── user-management.ts     # CRUD utilisateurs
│       ├── dashboard.ts           # Stats et graphiques
│       ├── global-search.service.ts  # BehaviorSubject partagé (recherche header)
│       └── toast.service.ts       # Notifications toast
├── modules/
│   ├── auth/         # Login, Register
│   ├── dashboard/    # Vue d'ensemble, stats, top médecins
│   ├── patients/     # Liste + formulaire patients
│   ├── medecins/     # Liste + formulaire médecins  (ADMIN)
│   ├── rendez-vous/  # Liste + formulaire RDV
│   └── utilisateurs/ # Liste + formulaire utilisateurs (ADMIN)
└── shared/
    ├── components/
    │   ├── search-bar/       # Barre de recherche avec debounce, sync globale
    │   ├── pagination/       # Pagination serveur générique
    │   ├── confirm-dialog/   # Dialog de confirmation (suppression, déconnexion)
    │   └── toast/            # Conteneur de notifications animées
    ├── models/               # Interfaces TypeScript (Patient, Medecin, RendezVous…)
    └── animations/           # Animations Angular (fadeInUp, staggerList, scaleIn)
```

## Recherche globale

La barre de recherche dans le header est reliée à `GlobalSearchService`. Chaque page s'y abonne :

- **Patients / Médecins** : déclenche un appel API (`/search?keyword=`)
- **Rendez-vous / Utilisateurs** : filtre les données chargées côté client
- La recherche locale (barre dans chaque page) met aussi à jour le header
- La recherche se réinitialise automatiquement à chaque changement de route
- Raccourci clavier : **Ctrl+K**

## Prérequis

- **Node.js 18+**
- **npm 9+** ou **yarn**
- Backend Clinix Manager démarré sur `http://localhost:8080`

## Installation

```bash
npm install
```

## Démarrage

```bash
ng serve
```

Application accessible sur **http://localhost:4200**.

## Build de production

```bash
ng build --configuration production
```

Artefacts générés dans `dist/`.

## Variables d'environnement

L'URL de l'API est définie directement dans les services (`http://localhost:8080/api`). Pour un environnement différent, modifier les fichiers dans `src/environments/` ou les constantes dans `src/app/core/services/`.
