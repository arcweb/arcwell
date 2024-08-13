import { Route } from '@angular/router';
import { DashboardComponent } from '@feature/dashboard/dashboard.component';
import { PeopleComponent } from '@feature/people/people.component';

export const DASHBOARD_ROUTES: Route[] = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: 'people',
        component: PeopleComponent,
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'people',
      },
    ],
  },
];
