import { Route } from '@angular/router';
import { AllUsersComponent } from './users-list/users-list.component';
import { UserManagementComponent } from './user-management.component';
import { UserComponent } from './user/user.component';

export const USER_MANAGEMENT_ROUTES: Route[] = [
  {
    path: '',
    component: UserManagementComponent,
    children: [
      {
        path: 'list',
        component: AllUsersComponent,
      },
      {
        path: 'list/:userId',
        component: UserComponent,
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'list',
      },
    ],
  },
];
