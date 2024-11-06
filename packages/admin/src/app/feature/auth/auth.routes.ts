import { Route } from '@angular/router';

export const AUTH_ROUTES: Route[] = [
  {
    path: 'login',
    redirectTo: '/login',
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'forgot',
    loadComponent: () =>
      import('./forgot-password/forgot-password-form.component').then(
        m => m.ForgotPasswordComponent,
      ),
  },
  {
    path: 'reset/:resetCode',
    loadComponent: () =>
      import('./reset-password/reset-password-form.component').then(
        m => m.ResetPasswordComponent,
      ),
  },
  {
    path: 'set/:email',
    loadComponent: () =>
      import('./set-password/set-password.component').then(
        m => m.SetPasswordComponent,
      ),
  },
  // {
  //   path: 'change',
  //   loadComponent: () =>
  //     import('./change-password/change-password-form.component').then(
  //       m => m.ChangePasswordComponent,
  //     ),
  // },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
];
