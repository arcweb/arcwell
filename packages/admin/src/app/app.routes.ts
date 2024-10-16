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
        path: '',
        canActivate: [isAuthenticatedGuard()],
        loadChildren: () =>
          import('./feature/main-navigation/main-navigation.routes').then(
            m => m.MAIN_NAVIGATION_ROUTES,
          ),
      },
      {
        // Invalid route - redirect to default home
        path: '**',
        redirectTo: '/',
      },
    ],
  },
];
