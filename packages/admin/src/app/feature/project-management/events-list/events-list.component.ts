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
import { JsonPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatPaginator } from '@angular/material/paginator';
import { ErrorContainerComponent } from '../error-container/error-container.component';
import { DateTime } from 'luxon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { convertDateTimeToLocal } from '@shared/helpers/date-format.helper';
import { FeatureStore } from '@app/shared/store/feature.store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { MatSortModule, Sort } from '@angular/material/sort';

@Component({
  selector: 'aw-events-list',
  standalone: true,
  imports: [
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
    'id',
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
        typeKey,
      );
    });
  }

  handleClick(row: EventModel) {
    this.router.navigate(['project-management', 'events', row.id]);
  }

  convertDateTimeToLocal(dateTime: DateTime | undefined): string {
    return convertDateTimeToLocal(dateTime);
  }

  sortChange(event: Sort) {
    this.typeKey$.subscribe(typeKey => {
      this.eventsListStore.load(
        this.eventsListStore.limit(),
        this.eventsListStore.offset(),
        event.active,
        event.direction,
        typeKey,
      );
    });
  }

  viewResource(resourceId: string) {
    this.router.navigate(['project-management', 'resources', resourceId]);
  }

  viewPerson(personId: string) {
    this.router.navigate(['project-management', 'people', personId]);
  }
}
