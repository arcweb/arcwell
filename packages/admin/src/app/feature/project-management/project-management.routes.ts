import { Route } from '@angular/router';
import { AllEventsComponent } from '@feature/project-management/all-events/all-events.component';
import { AllResourcesComponent } from '@feature/project-management/all-resources/all-resources.component';
import { PeopleTypesComponent } from '@feature/project-management/people-types/people-types.component';
import { PlaceholderComponent } from '@feature/project-management/placeholder/placeholder.component';
import { ProjectManagementComponent } from './project-management.component';
import { AllPeopleComponent } from '@feature/project-management/all-people/all-people.component';
import { PersonComponent } from '@feature/project-management/person/person.component';

export const PROJECT_MANAGEMENT_ROUTES: Route[] = [
  {
    path: '',
    component: ProjectManagementComponent,
    children: [
      // TODO: Move these child routes into their own routing config
      {
        path: 'people/all-people',
        component: AllPeopleComponent,
      },
      {
        path: 'people/all-people/:personId',
        component: PersonComponent,
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
