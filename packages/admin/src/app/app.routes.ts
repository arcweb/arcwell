import { Routes } from '@angular/router';
import { isAuthenticatedGuard } from '@shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'auth',
        loadChildren: () =>
          import('./feature/auth/auth.routes').then(m => m.AUTH_ROUTES),
      },
      {
        path: 'dashboard',
        canActivate: [isAuthenticatedGuard()],
        loadChildren: () =>
          import('./feature/dashboard/dashboard.routes').then(
            m => m.DASHBOARD_ROUTES,
          ),
      },
      {
        path: '',
        loadComponent: () =>
          import('./feature/home/home.component').then(m => m.HomeComponent),
        pathMatch: 'full',
      },
      // add data driven route matcher here.  Documentation: https://angular.dev/guide/routing/routing-with-urlmatcher
    ],
  },
];
