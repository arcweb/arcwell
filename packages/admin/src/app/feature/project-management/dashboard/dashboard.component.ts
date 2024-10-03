import { Component, inject } from '@angular/core';
import { MatCard, MatCardContent, MatCardFooter } from '@angular/material/card';
import { MatLabel } from '@angular/material/form-field';
import { PeopleListStore } from '../people-list/people-list.store';
import { EventsListStore } from '../events-list/events-list.store';
import { ResourcesListStore } from '../resources-list/resources-list.store';
import { FactsListStore } from '../facts-list/facts-list.store';
import { TagsListStore } from '../tags-list/tags-list.store';

@Component({
  selector: 'aw-dashboard',
  standalone: true,
  imports: [MatCard, MatLabel, MatCardContent, MatCardFooter],
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

  constructor() {
    if (!this.eventListStore.totalData()) {
      this.eventListStore.load({ limit: 1, offset: 0 });
    }
    if (!this.factsListStore.totalData()) {
      this.factsListStore.load({ limit: 1, offset: 0 });
    }
    if (!this.peopleListStore.totalData()) {
      this.peopleListStore.load({ limit: 1, offset: 0 });
    }
    if (!this.resourcesListStore.totalData()) {
      this.resourcesListStore.load({ limit: 1, offset: 0 });
    }
    if (!this.tagsListStore.totalData()) {
      this.tagsListStore.load(1, 0);
    }
  }
}
