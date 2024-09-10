import { Route } from '@angular/router';
import { AllEventsComponent } from '@feature/project-management/all-events/all-events.component';
import { AllResourcesComponent } from '@feature/project-management/all-resources/all-resources.component';
import { PersonTypesComponent } from '@app/feature/project-management/person-types/person-types.component';
import { PlaceholderComponent } from '@feature/project-management/placeholder/placeholder.component';
import { ProjectManagementComponent } from './project-management.component';
import { AllPeopleComponent } from '@feature/project-management/all-people/all-people.component';
import { PersonComponent } from '@feature/project-management/person/person.component';
import { PersonTypeComponent } from '@feature/project-management/person-type/person-type.component';
import { EventComponent } from '@feature/project-management/event/event.component';
import { AllEventTypesComponent } from './all-event-types/all-event-types.component';
import { EventTypeComponent } from './event-type/event-type.component';
import { AllFactsComponent } from '@feature/project-management/all-facts/all-facts.component';
import { FactComponent } from '@feature/project-management/fact/fact.component';
import { FactTypeComponent } from '@feature/project-management/fact-type/fact-type.component';
import { FactTypesComponent } from '@feature/project-management/fact-types/fact-types.component';

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
        path: 'people/person-types',
        component: PersonTypesComponent,
      },
      {
        path: 'people/person-types/:personTypeId',
        component: PersonTypeComponent,
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
        path: 'events/event-types',
        component: AllEventTypesComponent,
      },
      {
        path: 'events/event-types/:eventTypeId',
        component: EventTypeComponent,
      },
      {
        path: 'events/all-events',
        component: AllEventsComponent,
      },
      {
        path: 'events/all-events/:eventId',
        component: EventComponent,
      },
      {
        path: 'events',
        redirectTo: 'events/all-events',
      },
      {
        path: 'facts/all-facts',
        component: AllFactsComponent,
      },
      {
        path: 'facts/fact-types',
        component: FactTypesComponent,
      },
      {
        path: 'facts/fact-types/:factTypeId',
        component: FactTypeComponent,
      },

      {
        path: 'facts/all-facts/:factId',
        component: FactComponent,
      },

      {
        path: 'facts',
        redirectTo: 'facts/all-facts',
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
