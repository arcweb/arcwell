import { Route } from '@angular/router';
import { AllUsersComponent } from './users-list/users-list.component';
import { UsersComponent } from './users.component';
import { UserComponent } from './user/user.component';

export const USERS_ROUTES: Route[] = [
  {
    path: '',
    component: UsersComponent,
    children: [
      {
        path: 'list',
        component: AllUsersComponent,
        data: {
          detailComponent: UserComponent,
        },
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'list',
      },
    ],
  },
];
