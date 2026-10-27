# GestionComptes — Application de suivi budgétaire

Application web **Progressive Web App (PWA)** permettant de suivre ses comptes bancaires mois par mois, en s'appuyant sur un Google Sheet comme source de données.

---

## Stack technique

| Couche | Technologie |
|---|---|
| Framework | Angular 17.3 |
| Style | SCSS (par composant) |
| State management | Signals Angular (`signal`, `computed`, `input`) |
| Architecture | Standalone components, lazy routing, pas de NgModule |
| HTTP | `HttpClient` + intercepteur fonctionnel (JWT) |
| PWA | `manifest.webmanifest`, service worker |
| Build | Angular CLI 17 |

---

## Prérequis : le back-end

Cette application est un **front-end pur**. Elle ne contient aucune logique métier liée aux données — tout passe par appels REST vers une API back-end.

**Ce back-end est indispensable.** Il joue le rôle de passerelle entre l'application et un Google Sheet qui contient les données budgétaires (opérations réelles, prévisionnelles, récurrentes, soldes…).

L'URL de l'API est configurable directement depuis l'interface (voir section Configuration ci-dessous). Par défaut en développement : `http://localhost:8080`.

---

## Installation et lancement

```bash
# Installer les dépendances
npm install

# Lancer en développement
ng serve

# Builder pour la production
ng build --configuration production
```

Le résultat du build (dossier `dist/`) est à déployer sur un serveur web statique (ex : NAS Synology, nginx…).

---

## Fonctionnement de l'application

### 1. Connexion (`/login`)

Au premier accès, l'application affiche un formulaire de connexion (identifiant / mot de passe).

- Le token JWT retourné est stocké en `localStorage` pour persister entre les sessions (comportement PWA).
- Un **widget de diagnostic** est disponible sur cette page : il effectue 3 vérifications HTTP séquentielles pour valider la connectivité avec le back-end avant même de tenter une connexion.

### 2. Configuration de l'URL API (`/config` ou modal `⚙`)

Si l'URL du back-end change (ex : accès depuis l'extérieur vs. réseau local), elle se modifie sans rebuild :

- Via la page `/config` accessible sans authentification.
- Via le bouton `⚙` en haut à droite de l'application une fois connecté — ce bouton ouvre un modal qui permet aussi de relancer le diagnostic de connectivité.

L'URL est persistée en `localStorage`.

### 3. Ecran principal (`/comptes`)

C'est l'écran central de l'application. Il est protégé par un guard d'authentification (redirect vers `/login` si pas de token).

En haut de l'écran :
- **Navigation entre les mois** (flèches gauche/droite) avec le mois courant affiché au centre.
- **4 onglets** décrits ci-dessous.

Les données du mois sélectionné sont automatiquement rechargées à chaque changement de mois, à chaque retour sur l'onglet Pointage ou Edition, et à chaque retour en visibilité de l'onglet navigateur (pratique sur mobile).

---

### Onglet Consultation

Affiche un **récapitulatif complet du mois** :

- **Soldes réels et prévisionnels** pour chacun des deux comptes (CCM et Boursorama).
- **Opérations réelles** : les dépenses et revenus déjà débitées/créditées, triées par date décroissante.
- **Opérations à venir** : opérations planifiées pour le mois mais pas encore passées.
- **Opérations récurrentes** : charges fixes mensuelles.

Chaque section est collapsible (clic sur le titre pour réduire/agrandir).

Un filtre par compte permet d'afficher uniquement les opérations CCM, uniquement Boursorama, ou les deux. Ce réglage est mémorisé entre les sessions.

---

### Onglet Saisie

Formulaire pour **ajouter une nouvelle opération** sur le mois courant.

Champs disponibles :
- **Libellé** (obligatoire)
- **Compte** : CCM ou Boursorama
- **Sens** : débit ou crédit
- **Montant** (obligatoire, positif)
- **Déjà débité** : si coché, l'opération est créée directement dans les réelles avec sa date ; sinon elle est ajoutée dans les "à venir".

Un brouillon est sauvegardé en `sessionStorage` pour éviter de perdre une saisie en cours en cas de navigation accidentelle.

---

### Onglet Pointage

Permet de **pointer les opérations prévisionnelles** — c'est-à-dire de valider qu'une opération "à venir" est bien passée en réel.

- La liste affiche uniquement les opérations non encore pointées.
- Un clic sur une opération ouvre un formulaire inline pour renseigner la **date réelle**, le **libellé définitif** et le **montant exact**.
- Une option "Déduire des courses" est disponible pour les opérations concernées.
- Une fois pointée, l'opération bascule dans la liste "Pointées ce mois-ci" (affichée en dessous).
- Un champ de recherche permet de filtrer les opérations par libellé.

---

### Onglet Edition

Permet de **modifier ou supprimer** des opérations existantes.

- Affiche deux listes : les opérations réelles et les opérations "à venir" (avec filtre texte).
- Un clic sur une opération charge ses données dans un formulaire d'édition (libellé, sens, montant, compte, date).
- Actions disponibles selon le type d'opération :
  - **Modifier** : met à jour l'opération dans le Google Sheet.
  - **Dépointer** : remet une opération réelle dans les "à venir".
  - **Supprimer** : supprime définitivement l'opération (confirmation requise).

---

## Deux comptes gérés

L'application gère simultanément deux comptes bancaires :

- **CCM** (Crédit Mutuel)
- **Boursorama**

Chaque opération est rattachée à l'un des deux comptes. Les soldes sont calculés et affichés séparément pour chacun.
