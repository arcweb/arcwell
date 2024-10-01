import { Route } from '@angular/router';
import { isAuthenticatedGuard } from '@app/shared/guards/auth.guard';
import { HomeComponent } from './home.component';

export const HOME_ROUTES: Route[] = [
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: 'project-management',
        canActivate: [isAuthenticatedGuard()],
        loadChildren: () =>
          import('../project-management/project-management.routes').then(
            m => m.PROJECT_MANAGEMENT_ROUTES,
          ),
      },
      {
        path: 'account-management',
        canActivate: [isAuthenticatedGuard()],
        loadComponent: () =>
          import('../account-management/account-management.component').then(
            m => m.AccountManagementComponent,
          ),
      },
      {
        path: 'user-management',
        canActivate: [isAuthenticatedGuard()],
        loadChildren: () =>
          import('../user-management/user-management.routes').then(
            m => m.USER_MANAGEMENT_ROUTES,
          ),
      },
    ],
  },
];
