import { Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
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
import { EventsStore } from './events.store';
import { JsonPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatPaginator } from '@angular/material/paginator';
import { ErrorContainerComponent } from '../error-container/error-container.component';
import { DateTime } from 'luxon';

@Component({
  selector: 'aw-all-events',
  standalone: true,
  imports: [
    JsonPipe,
    ErrorContainerComponent,
    MatIcon,
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
  ],
  providers: [EventsStore],
  templateUrl: './all-events.component.html',
  styleUrl: './all-events.component.scss',
})
export class AllEventsComponent {
  readonly eventsStore = inject(EventsStore);
  private router = inject(Router);

  pageSizes = [10, 20, 50];
  dataSource = new MatTableDataSource<EventModel>();
  displayedColumns: string[] = [
    'id',
    'name',
    'source',
    'occurredAt',
    'eventType',
    'tags',
  ];

  constructor() {
    effect(() => {
      this.dataSource.data = this.eventsStore.events();
    });
  }

  handleClick(row: EventModel) {
    this.router.navigate([
      'project-management',
      'events',
      'all-events',
      row.id,
    ]);
  }

  viewEvent(eventId: string) {
    this.router.navigate([
      'project-management',
      'events',
      'all-events',
      eventId,
    ]);
  }

  convertDate(dateTime: DateTime | undefined) {
    if (dateTime) {
      return dateTime.toLocaleString(DateTime.DATETIME_SHORT);
    }
    return '';
  }
}
