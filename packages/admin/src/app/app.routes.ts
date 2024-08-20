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
        path: 'project-management',
        canActivate: [isAuthenticatedGuard()],
        loadChildren: () =>
          import('./feature/project-management/project-management.routes').then(
            m => m.PROJECT_MANAGEMENT_ROUTES,
          ),
      },
      {
        path: '',
        loadComponent: () =>
          import('./feature/home/home.component').then(m => m.HomeComponent),
        pathMatch: 'full',
      },
      {
        path: 'account-management',
        canActivate: [isAuthenticatedGuard()],
        loadComponent: () =>
          import(
            './feature/account-management/account-management.component'
          ).then(m => m.AccountManagementComponent),
      },
      // add data driven route matcher here.  Documentation: https://angular.dev/guide/routing/routing-with-urlmatcher
    ],
  },
];
