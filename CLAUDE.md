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
│   ├── config.service.ts       URL API : localStorage['api_url'] en priorité, puis environment.apiUrl
│   ├── diagnostic.service.ts   3 checks HTTP séquentiels sur GET /api/status
│   ├── sheets.service.ts       appels REST months
│   ├── models.ts               Operation, MonthData, OperationRequest…
│   └── month-utils.ts
├── pages/
│   ├── login/                  formulaire + widget diagnostic collapsible
│   ├── config/                 page /config pour changer l'URL serveur
│   └── comptes/                shell principal
│       ├── comptes.*           topbar (bouton ⚙), tabs, signal showConfig, rechargement données
│       ├── consultation/       3 sections collapsibles : Réelles / À venir / Récurrents
│       ├── saisie/             formulaire ajout opération
│       ├── pointage/           liste prévisionnels avec formulaire inline (libellé + date)
│       └── edition/
└── shared/
    ├── config-modal/           modal ⚙ : URL + diagnostic (délègue à DiagnosticWidgetComponent)
    ├── diagnostic-widget/      widget diagnostic autonome : DiagStatus, DiagCheck, inputs url/username/password, run(), diagRunning
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
`ConfigService` lit `localStorage['api_url']` en priorité, sinon `environment.apiUrl`.
Modifiable via le modal ⚙ (topbar comptes) ou la page `/config`.

### Rechargement des données
- Navigation entre mois → `loadMonth()`
- Switch vers l'onglet Pointage → `loadMonth()` (évite les numéros de ligne périmés)
- Après saisie → toast uniquement, pas de rechargement automatique

## Conventions de code
- Chaque composant a ses fichiers `.ts`, `.html`, `.scss` séparés
- Signals Angular pour l'état réactif : `signal()`, `computed()`, `input()` (signal input Angular 17)
- Préférer `input<T>()` à `@Input()` pour les nouvelles propriétés en entrée
- `computed()` pour les dérivés (listes filtrées, agrégats) — pas de getters simples
- `CommonModule` remplacé par les imports granulaires (`DecimalPipe`, `FormsModule`…)
- Pas de modules NgModule (standalone uniquement)

## Couleur principale
`#83d087` (vert doux) — topbar, boutons, tabs actifs, crédits, cercles pointés, badges

## Build et déploiement
```bash
ng build --configuration production
```
Résultat dans `dist/` à copier sur le NAS Synology.
