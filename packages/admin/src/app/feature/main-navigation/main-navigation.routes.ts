import { Route } from '@angular/router';
import { EventsListComponent } from '@app/feature/events-list/events-list.component';
import { ResourcesListComponent } from '@feature/resources-list/resources-list.component';
import { PersonTypesComponent } from '@feature/person-types/person-types.component';
import { MainNavigationComponent } from './main-navigation.component';
import { PeopleListComponent } from '@app/feature/people-list/people-list.component';
import { PersonComponent } from '@app/feature/person/person.component';
import { PersonTypeComponent } from '@app/feature/person-type/person-type.component';
import { EventComponent } from '@app/feature/event/event.component';
import { EventTypesComponent } from '@app/feature/event-types/event-types.component';
import { EventTypeComponent } from '@app/feature/event-type/event-type.component';
import { ResourceComponent } from '@app/feature/resource/resource.component';
import { ResourceTypesComponent } from '@app/feature/resource-types/resource-types.component';
import { ResourceTypeComponent } from '@app/feature/resource-type/resource-type.component';
import { FactsListComponent } from '@feature/facts-list/facts-list.component';
import { FactComponent } from '@app/feature/fact/fact.component';
import { FactTypeComponent } from '@app/feature/fact-type/fact-type.component';
import { FactTypesComponent } from '@feature/fact-types/fact-types.component';
import { CohortComponent } from '@app/feature/cohort/cohort.component';
import { CohortsListComponent } from '@feature/cohorts-list/cohorts-list.component';
import { TagsListComponent } from '../tags-list/tags-list.component';
import { TagComponent } from '../tag/tag.component';
import { SettingsComponent } from '../settings/settings.component';
import { DashboardComponent } from '@feature/dashboard/dashboard.component';
import { UserComponent } from '../users/user/user.component';

export const MAIN_NAVIGATION_ROUTES: Route[] = [
  {
    path: '',
    component: MainNavigationComponent,
    children: [
      // TODO: Move these child routes into their own routing config
      // dashboard routes
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
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
      {
        path: 'settings',
        component: SettingsComponent,
      },
      {
        path: 'settings/profile',
        component: UserComponent,
        data: {
          isProfile: true,
        },
      },
      {
        path: 'settings/users',
        loadChildren: () =>
          import('../users/users.routes').then(m => m.USERS_ROUTES),
      },
      // fallback routes
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
    ],
  },
];
