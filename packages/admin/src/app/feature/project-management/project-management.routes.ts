import { Route } from '@angular/router';
import { EventsListComponent } from '@app/feature/project-management/events-list/events-list.component';
import { ResourcesListComponent } from '@feature/project-management/resources-list/resources-list.component';
import { PersonTypesComponent } from '@app/feature/project-management/person-types/person-types.component';
import { ProjectManagementComponent } from './project-management.component';
import { PeopleListComponent } from '@feature/project-management/people-list/people-list.component';
import { PersonComponent } from '@feature/project-management/person/person.component';
import { PersonTypeComponent } from '@feature/project-management/person-type/person-type.component';
import { EventComponent } from '@feature/project-management/event/event.component';
import { EventTypesComponent } from './event-types/event-types.component';
import { EventTypeComponent } from './event-type/event-type.component';
import { ResourceComponent } from './resource/resource.component';
import { ResourceTypesComponent } from './resource-types/resource-types.component';
import { ResourceTypeComponent } from './resource-type/resource-type.component';
import { FactsListComponent } from '@feature/project-management/facts-list/facts-list.component';
import { FactComponent } from '@feature/project-management/fact/fact.component';
import { FactTypeComponent } from '@feature/project-management/fact-type/fact-type.component';
import { FactTypesComponent } from '@feature/project-management/fact-types/fact-types.component';
import { CohortComponent } from '@feature/project-management/cohort/cohort.component';
import { CohortsListComponent } from '@feature/project-management/cohorts-list/cohorts-list.component';
import { TagsListComponent } from './tags-list/tags-list.component';
import { TagComponent } from './tag/tag.component';

export const PROJECT_MANAGEMENT_ROUTES: Route[] = [
  {
    path: '',
    component: ProjectManagementComponent,
    children: [
      // TODO: Move these child routes into their own routing config
      // people routes
      {
        path: 'people/list',
        component: PeopleListComponent,
      },
      {
        path: 'people/list/:typeKey',
        component: PeopleListComponent,
      },
      {
        path: 'people/types',
        component: PersonTypesComponent,
      },
      {
        path: 'people/types/:personTypeId',
        component: PersonTypeComponent,
      },
      {
        path: 'people/:personId',
        component: PersonComponent,
      },
      {
        path: 'people',
        redirectTo: 'people/list',
      },
      // cohorts routes
      {
        path: 'cohorts/list',
        component: CohortsListComponent,
      },
      {
        path: 'cohorts',
        redirectTo: 'cohorts/list',
      },
      {
        path: 'cohorts/:cohortId',
        component: CohortComponent,
      },
      // resources routes
      {
        path: 'resources/list',
        component: ResourcesListComponent,
      },
      {
        path: 'resources/list/:typeKey',
        component: ResourcesListComponent,
      },
      {
        path: 'resources/types',
        component: ResourceTypesComponent,
      },
      {
        path: 'resources/types/:resourceTypeId',
        component: ResourceTypeComponent,
      },
      {
        path: 'resources/:resourceId',
        component: ResourceComponent,
      },
      {
        path: 'resources',
        redirectTo: 'resources/list',
      },
      // events routes
      {
        path: 'events/list',
        component: EventsListComponent,
      },
      {
        path: 'events/list/:typeKey',
        component: EventsListComponent,
      },
      {
        path: 'events/types',
        component: EventTypesComponent,
      },
      {
        path: 'events/types/:eventTypeId',
        component: EventTypeComponent,
      },
      {
        path: 'events/:eventId',
        component: EventComponent,
      },
      {
        path: 'events',
        redirectTo: 'events/list',
      },
      // facts routes
      {
        path: 'facts/list',
        component: FactsListComponent,
      },
      {
        path: 'facts/list/:typeKey',
        component: FactsListComponent,
      },
      {
        path: 'facts/types',
        component: FactTypesComponent,
      },
      {
        path: 'facts/types/:factTypeId',
        component: FactTypeComponent,
      },
      {
        path: 'facts/:factId',
        component: FactComponent,
      },
      {
        path: 'facts',
        redirectTo: 'facts/list',
      },
      // tags routes
      {
        path: 'tags/list',
        component: TagsListComponent,
      },
      {
        path: 'tags/:tagId',
        component: TagComponent,
      },
      {
        path: 'tags',
        redirectTo: 'tags/list',
      },
      // fallback routes
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'people/list',
      },
      {
        path: '**',
        redirectTo: 'people/list',
      },
    ],
  },
];
