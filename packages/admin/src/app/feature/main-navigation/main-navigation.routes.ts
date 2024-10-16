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
        data: {
          detailComponent: PersonComponent,
        },
      },
      {
        path: 'people/list/:type_key',
        component: PeopleListComponent,
        data: {
          detailComponent: PersonComponent,
        },
      },
      {
        path: 'people/types',
        component: PersonTypesComponent,
        data: {
          detailComponent: PersonTypeComponent,
        },
      },
      {
        path: 'people',
        redirectTo: 'people/list',
      },
      // cohorts routes
      {
        path: 'cohorts/list',
        component: CohortsListComponent,
        data: {
          detailComponent: CohortComponent,
        },
      },
      {
        path: 'cohorts',
        redirectTo: 'cohorts/list',
      },
      // resources routes
      {
        path: 'resources/list',
        component: ResourcesListComponent,
        data: {
          detailComponent: ResourceComponent,
        },
      },
      {
        path: 'resources/list/:type_key',
        component: ResourcesListComponent,
        data: {
          detailComponent: ResourceComponent,
        },
      },
      {
        path: 'resources/types',
        component: ResourceTypesComponent,
        data: {
          detailComponent: ResourceTypeComponent,
        },
      },
      {
        path: 'resources',
        redirectTo: 'resources/list',
      },
      // events routes
      {
        path: 'events/list',
        component: EventsListComponent,
        data: {
          detailComponent: EventComponent,
        },
      },
      {
        path: 'events/list/:type_key',
        component: EventsListComponent,
        data: {
          detailComponent: EventComponent,
        },
      },
      {
        path: 'events/types',
        component: EventTypesComponent,
        data: {
          detailComponent: EventTypeComponent,
        },
      },
      {
        path: 'events',
        redirectTo: 'events/list',
      },
      // facts routes
      {
        path: 'facts/list',
        component: FactsListComponent,
        data: {
          detailComponent: FactComponent,
        },
      },
      {
        path: 'facts/list/:type_key',
        component: FactsListComponent,
        data: {
          detailComponent: FactComponent,
        },
      },
      {
        path: 'facts/types',
        component: FactTypesComponent,
        data: {
          detailComponent: FactTypeComponent,
        },
      },
      {
        path: 'facts',
        redirectTo: 'facts/list',
      },
      // tags routes
      {
        path: 'tags/list',
        component: TagsListComponent,
        data: {
          detailComponent: TagComponent,
        },
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
