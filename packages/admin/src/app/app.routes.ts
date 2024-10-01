import { Routes } from '@angular/router';
import { isAuthenticatedGuard } from '@shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./feature/auth/login/login.component').then(
            m => m.LoginComponent,
          ),
      },
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
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },
];
