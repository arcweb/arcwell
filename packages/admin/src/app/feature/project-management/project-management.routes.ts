import { EventType, Route } from '@angular/router';
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
import { SettingsComponent } from './settings/settings.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserComponent } from '../user-management/user/user.component';

export const PROJECT_MANAGEMENT_ROUTES: Route[] = [
  {
    path: '',
    component: ProjectManagementComponent,
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
        path: 'settings/user-management',
        loadChildren: () =>
          import('../user-management/user-management.routes').then(
            m => m.USER_MANAGEMENT_ROUTES,
          ),
      },
      // fallback routes
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: '**',
        redirectTo: 'dashboard',
      },
    ],
  },
];
