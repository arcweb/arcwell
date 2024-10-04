import { Component, inject } from '@angular/core';
import { MatCard, MatCardContent, MatCardFooter } from '@angular/material/card';
import { MatLabel } from '@angular/material/form-field';
import { PeopleListStore } from '../people-list/people-list.store';
import { EventsListStore } from '../events-list/events-list.store';
import { ResourcesListStore } from '../resources-list/resources-list.store';
import { FactsListStore } from '../facts-list/facts-list.store';
import { TagsListStore } from '../tags-list/tags-list.store';
import { Router } from '@angular/router';
import { ErrorContainerComponent } from '@feature/project-management/error-container/error-container.component';

@Component({
  selector: 'aw-dashboard',
  standalone: true,
  imports: [
    MatCard,
    MatLabel,
    MatCardContent,
    MatCardFooter,
    ErrorContainerComponent,
  ],
  providers: [
    EventsListStore,
    FactsListStore,
    PeopleListStore,
    ResourcesListStore,
    TagsListStore,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  readonly eventListStore = inject(EventsListStore);
  readonly factsListStore = inject(FactsListStore);
  readonly peopleListStore = inject(PeopleListStore);
  readonly resourcesListStore = inject(ResourcesListStore);
  readonly tagsListStore = inject(TagsListStore);
  private router = inject(Router);

  constructor() {
    if (!this.eventListStore.totalData()) {
      this.eventListStore.count();
    }
    if (!this.factsListStore.totalData()) {
      this.factsListStore.count();
    }
    if (!this.peopleListStore.totalData()) {
      this.peopleListStore.count();
    }
    if (!this.resourcesListStore.totalData()) {
      this.resourcesListStore.count();
    }
    if (!this.tagsListStore.totalData()) {
      this.tagsListStore.count();
    }
  }

  cardClick(route: string) {
    const link = '/project-management' + route;
    this.router.navigate([link]);
  }
}
