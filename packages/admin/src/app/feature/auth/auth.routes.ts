import { Route } from '@angular/router';

export const AUTH_ROUTES: Route[] = [
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then(m => m.LoginComponent),
  },
  // {
  //   path: 'register',
  //   loadComponent: () => import('./register/register.component'),
  // },
  {
    path: 'forgot',
    loadComponent: () =>
      import('./forgot-password/forgot-password-form.component').then(
        m => m.ForgotPasswordComponent,
      ),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
