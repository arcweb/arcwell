import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: 'people',
        pathMatch: 'full',
      },
      {
        path: 'people',
        loadComponent: () =>
          import('./feature/people/people.component').then(
            m => m.PeopleComponent,
          ),
      },
      // add data driven route matcher here.  Documentation: https://angular.dev/guide/routing/routing-with-urlmatcher
    ],
  },
];
