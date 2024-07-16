import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./feature/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
    ],
  },
];
