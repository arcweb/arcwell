import { Routes } from '@angular/router';
import { AuthGuard } from '@guards/auth.guard';
import { LoginGuard } from '@guards/login.guard';
import { LoginPage } from '@pages/login/login.page';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginPage,
    canActivate: [LoginGuard],
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
    canActivate: [AuthGuard],
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'phq9',
    loadComponent: () => import('./pages/phq9/phq9.page').then(m => m.Phq9Page),
    canActivate: [AuthGuard],
  },
];
