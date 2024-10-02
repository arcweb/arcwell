import { Component, effect, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource,
} from '@angular/material/table';
import { EventModel } from '@app/shared/models/event.model';
import { EventsListStore } from './events-list.store';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatPaginator } from '@angular/material/paginator';
import { ErrorContainerComponent } from '../error-container/error-container.component';
import { MatButton, MatIconButton } from '@angular/material/button';
import { FeatureStore } from '@app/shared/store/feature.store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { MatSortModule, Sort } from '@angular/material/sort';
import { EventsTableComponent } from '@app/shared/components/events-table/events-table.component';

@Component({
  selector: 'aw-events-list',
  standalone: true,
  imports: [
    AsyncPipe,
    JsonPipe,
    MatTable,
    MatColumnDef,
    MatRowDef,
    MatHeaderRowDef,
    MatCellDef,
    MatHeaderCellDef,
    MatRow,
    MatCell,
    MatHeaderCell,
    MatHeaderRow,
    MatPaginator,
    ErrorContainerComponent,
    MatIcon,
    RouterLink,
    MatIconButton,
    MatSortModule,
    MatButton,
    EventsTableComponent,
  ],
  providers: [EventsListStore],
  templateUrl: './events-list.component.html',
  styleUrl: './events-list.component.scss',
})
export class EventsListComponent {
  readonly eventsListStore = inject(EventsListStore);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  readonly featureStore = inject(FeatureStore);
  typeKey$ = this.activatedRoute.params.pipe(
    takeUntilDestroyed(),
    map(({ typeKey }) => typeKey),
  );

  pageSizes = [10, 20, 50];
  dataSource = new MatTableDataSource<EventModel>();
  displayedColumns: string[] = [
    'startedAt',
    'endedAt',
    'eventType',
    'person',
    'resource',
    'tags',
  ];

  constructor() {
    effect(() => {
      this.dataSource.data = this.eventsListStore.events();
    });
    // load the events list based on the route parameters if they exist
    this.typeKey$.subscribe(typeKey => {
      this.eventsListStore.load(
        this.eventsListStore.limit(),
        0,
        '',
        '',
        0,
        typeKey,
      );
    });
  }

  rowClick(row: EventModel) {
    this.router.navigate(['project-management', 'events', row.id]);
  }

  sortChange(event: Sort) {
    this.eventsListStore.load(
      this.eventsListStore.limit(),
      this.eventsListStore.offset(),
      event.active,
      event.direction,
      this.eventsListStore.pageIndex(),
      this.eventsListStore.typeKey(),
    );
  }

  viewResource(resourceId: string) {
    this.router.navigate(['project-management', 'resources', resourceId]);
  }

  viewPerson(personId: string) {
    this.router.navigate(['project-management', 'people', personId]);
  }
}
