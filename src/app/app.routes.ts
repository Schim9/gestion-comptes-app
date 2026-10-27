import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'config',
    loadComponent: () => import('./pages/config/config.component').then(m => m.ConfigComponent)
  },
  {
    path: 'comptes',
    loadComponent: () => import('./pages/comptes/comptes.component').then(m => m.ComptesComponent),
    canActivate: [authGuard]
  },
  { path: '', redirectTo: 'comptes', pathMatch: 'full' },
  { path: '**', redirectTo: 'comptes' }
];
