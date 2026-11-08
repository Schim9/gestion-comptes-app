# GestionComptes — Front-end (Angular)

## Stack
- Angular 17.3, standalone components, signals
- Syntax de contrôle : `@if` / `@for` (pas `*ngIf` / `*ngFor`)
- HttpClient avec intercepteur fonctionnel
- Lazy routing, SCSS séparé par composant
- PWA : `manifest.webmanifest`, icônes dans `src/assets/icons/`, `theme_color: #83d087`

## Structure

```
src/app/
├── core/
│   ├── auth.service.ts         login / logout / token localStorage
│   ├── auth.guard.ts           canActivate → /login si pas de token
│   ├── auth.interceptor.ts     ajoute Bearer + redirect 401/403
│   ├── config.service.ts       URL API (localStorage['api_url'] / environment.apiUrl), credentials, filtre comptes, onglet par défaut ; saveServerConfig(url, username, password)
│   ├── diagnostic.service.ts   2 méthodes : checkStatus (GET /api/status → { health: DiagResult, sheets: DiagResult }), checkCredentials (POST /api/auth/login)
│   ├── sheets.service.ts       appels REST months
│   ├── models.ts               Operation, MonthData, OperationRequest, UpdateOperationRequest…
│   └── month-utils.ts
├── pages/
│   ├── login/                  formulaire + widget diagnostic collapsible
│   ├── config/                 page /config pour changer l'URL serveur
│   └── comptes/                shell principal
│       ├── comptes.*           topbar (bouton ⚙), tabs, signal showConfig, rechargement données
│       ├── consultation/       3 sections collapsibles : Réelles / À venir / Récurrents
│       ├── saisie/             formulaire ajout opération (brouillon sessionStorage, case "Déduire des courses" si dejaDebite)
│       ├── pointage/           liste prévisionnels avec formulaire inline ; bouton "→ Mois suivant" pour type=a_venir
│       └── edition/            3 sections : Réelles / À venir / Récurrents ; action "Vider le montant" pour récurrents
└── shared/
    ├── config-modal/           modal ⚙ : URL serveur, credentials (username/password), onglet par défaut, diagnostic (délègue à DiagnosticWidgetComponent)
    ├── diagnostic-widget/      widget diagnostic autonome : DiagStatus, DiagCheck, input<string>() url/username/password, run(), diagRunning (signal)
    └── toast/                  ToastService (signal) + ToastComponent
```

## Routing

| Route | Guard | Composant |
|---|---|---|
| `/login` | — | LoginComponent |
| `/config` | — | ConfigComponent |
| `/comptes` | authGuard | ComptesComponent |
| `**` | — | redirect /comptes |

## Comportements importants

### JWT
Stocké en `localStorage` (persistance PWA). L'intercepteur ajoute `Authorization: Bearer <token>` à chaque requête.
Redirect vers `/login` sur 401/403 **uniquement si un token est présent** (évite la boucle pendant le diagnostic).

### URL API
`ConfigService` lit `localStorage['api_url']` en priorité, sinon `environment.apiUrl`. Stocke la base sans `/api` ; `getApiUrl()` ajoute le suffixe `/api` automatiquement.
Modifiable via le modal ⚙ (topbar comptes) ou la page `/config`.

### Persistence localStorage
`ConfigService` centralise plusieurs clés :
- `api_url` : URL de base du serveur
- `saved_credentials` : username/password pour le diagnostic
- `account_filter` : filtre CCM/Boursorama mémorisé entre sessions
- `default_tab` : onglet ouvert au démarrage (`consultation`, `saisie` ou `pointage`)

### Rechargement des données
- Navigation entre mois → `loadMonth()`
- Switch vers l'onglet Pointage ou Edition → `loadMonth()` (évite les numéros de ligne périmés)
- Après saisie → toast uniquement, pas de rechargement automatique

### models.ts — types notables
- `UpdateOperationRequest.montant` : `number | null` (null → vide la cellule via PATCH)
- `OperationRequest.deduireDesCourses` : `boolean` optionnel (envoyé uniquement si `dejaDebite=true`)

### Onglet Saisir
- Case "Déduire des courses" visible uniquement quand `dejaDebite = true`
- Brouillon de formulaire persisté en `sessionStorage` (clé `saisie_form_draft`)

### Onglet Pointage
- Bouton "→ Mois suivant" affiché uniquement pour `type === 'a_venir'`
- `confirmTransfert` (boolean local) : confirmation inline avant appel `transfererOperation`
- `deduireDesCourses` supprimé de ce composant (déplacé dans Saisir)

### Onglet Éditer
- Trois sections : Réelles, À venir, Récurrents (`filteredRecurrents`, `isRecurrent()`)
- Pour les récurrents : action `'vider'` via `confirmAction` → PATCH avec `montant: null`
- Pas de bouton Supprimer pour les récurrents (utiliser "Vider le montant" uniquement)

## Conventions de code
- Chaque composant a ses fichiers `.ts`, `.html`, `.scss` séparés
- `input<T>()` signal partout — pas de `@Input()` décorateur
- `signal()` pour tout l'état local (`loading`, `filterText`, `diagRunning`, `checks`, `saved`…)
- `computed()` pour tous les dérivés (listes filtrées, agrégats, labels) — pas de getters
- Imports granulaires uniquement (`DecimalPipe`, `FormsModule`…) — pas de `CommonModule`
- Pas de modules NgModule (standalone uniquement)
- `switchMap` pour les appels HTTP annulables (ex : rechargement de mois dans ComptesComponent)

## Couleur principale
`#83d087` (vert doux) — topbar, boutons, tabs actifs, crédits, cercles pointés, badges

## Build et déploiement
```bash
ng build --configuration production
```
Résultat dans `dist/` à copier sur le NAS Synology.
