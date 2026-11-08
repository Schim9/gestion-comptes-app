# Todo — Revue architecturale GestionComptes Front-end

## Court terme

- [x] **Remplacer `CommonModule` par imports granulaires** — fait dans tous les composants
- [x] **Convertir `@Input()` en `input<T>()` signal** — fait dans saisie, pointage, edition, diagnostic-widget
- [x] **Ajouter une constante pour la clé `account_filter` dans ConfigService** — fait
- [x] **Remplacer `monthLabel` par un `computed()`** — fait dans ComptesComponent
- [x] **Convertir les getters de PointageComponent en `computed()`** — fait (pendingItems, filteredPendingItems, pointedItems)

## Moyen terme

- [x] **Harmoniser `loading` : signal partout** — fait dans saisie et edition
- [x] **Aligner le type `date` dans EditionComponent.form** — fait
- [x] **Fusionner `checkHealth` et `checkSheets` en un seul appel HTTP** — fait : `checkStatus()` retourne `{ health, sheets }` en un seul GET /api/status
- [x] **Documenter le compromis sécurité `saved_credentials`** — fait

## Pas d'urgence / constaté OK

- Aucun secret codé en dur dans le code versionné
- Pas de dépendance circulaire entre services
- Pas de logique métier dans les composants qui devrait être dans un service
- Intercepteur fonctionnel avec logique anti-boucle 401 correcte
- Lazy routing sur toutes les pages
- `month-utils.ts` pur et testable
