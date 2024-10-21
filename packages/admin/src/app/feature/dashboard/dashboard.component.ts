import { Component, inject } from '@angular/core';
import { MatCard, MatCardContent, MatCardFooter } from '@angular/material/card';
import { MatLabel } from '@angular/material/form-field';
import { PeopleListStore } from '@app/feature/people-list/people-list.store';
import { EventsListStore } from '@app/feature/events-list/events-list.store';
import { ResourcesListStore } from '@app/feature/resources-list/resources-list.store';
import { FactsListStore } from '@app/feature/facts-list/facts-list.store';
import { TagsListStore } from '../tags-list/tags-list.store';
import { Router } from '@angular/router';
import { ErrorContainerComponent } from '@app/feature/error-container/error-container.component';
import { AuthStore } from '@app/shared/store/auth.store';
import { FeatureStore } from '@app/shared/store/feature.store';

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
  readonly authStore = inject(AuthStore);
  readonly featureStore = inject(FeatureStore);
  private router = inject(Router);

  constructor() {
    if (this.authStore.currentUser()) {
      this.featureStore.load();
    }
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

    // if (this.authStore.currentUser()) {
    //   this.featureStore.load();
    // }
  }

  cardClick(route: string) {
    const link = '/' + route;
    this.router.navigate([link]);
  }
}
