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
    path: '',
    redirectTo: 'surveys',
    pathMatch: 'full',
  },
  {
    path: 'surveys',
    loadComponent: () => import('./pages/surveys/surveys.page').then(m => m.SurveysPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'results',
    loadComponent: () => import('./pages/results/results.page').then( m => m.ResultsPage)
  },
];
