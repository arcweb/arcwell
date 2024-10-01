import { Route } from '@angular/router';
import { AllUsersComponent } from './all-users/all-users.component';
import { UserManagementComponent } from './user-management.component';
import { UserComponent } from './user/user.component';

export const USER_MANAGEMENT_ROUTES: Route[] = [
  {
    path: '',
    component: UserManagementComponent,
    children: [
      {
        path: 'all-users',
        component: AllUsersComponent,
      },
      {
        path: 'all-users/:userId',
        component: UserComponent,
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'all-users',
      },
    ],
  },
];
