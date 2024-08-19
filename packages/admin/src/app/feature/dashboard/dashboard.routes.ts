import { Route } from '@angular/router';
import { AllEventsComponent } from '@app/subFeature/all-events/all-events.component';
import { AllResourcesComponent } from '@app/subFeature/all-resources/all-resources.component';
import { PeopleTypesComponent } from '@app/subFeature/people-types/people-types.component';
import { PlaceholderComponent } from '@app/subFeature/placeholder/placeholder.component';
import { DashboardComponent } from '@feature/dashboard/dashboard.component';
import { AllPeopleComponent } from '@subFeature/all-people/all-people.component';

export const DASHBOARD_ROUTES: Route[] = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      // TODO: Move these child routes into their own routing config
      {
        path: 'people/all-people',
        component: AllPeopleComponent,
      },
      {
        path: 'people/people-types',
        component: PeopleTypesComponent,
      },
      {
        path: 'people',
        redirectTo: 'people/all-people',
      },
      {
        path: 'resources/all-resources',
        component: AllResourcesComponent,
      },
      {
        path: 'resources',
        redirectTo: 'resources/all-resources',
      },
      {
        path: 'resources/resource-types',
        component: PlaceholderComponent,
      },
      {
        path: 'events',
        redirectTo: 'events/all-events',
      },
      {
        path: 'events/event-types',
        component: PlaceholderComponent,
      },
      {
        path: 'events/all-events',
        component: AllEventsComponent,
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'people/all-people',
      },
      {
        path: '**',
        redirectTo: 'people/all-people',
      },
    ],
  },
];
