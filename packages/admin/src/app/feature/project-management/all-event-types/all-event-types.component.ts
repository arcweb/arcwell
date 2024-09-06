import { Component, effect, inject } from '@angular/core';
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
import { Router, RouterLink } from '@angular/router';
import { EventTypeModel } from '@app/shared/models/event-type.model';
import { EventTypesStore } from './event-types.store';
import { JsonPipe } from '@angular/common';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatPaginator } from '@angular/material/paginator';
import { ErrorContainerComponent } from '../error-container/error-container.component';

@Component({
  selector: 'aw-all-event-types',
  standalone: true,
  imports: [
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
    ErrorContainerComponent,
    JsonPipe,
    MatIcon,
    MatIconButton,
    MatPaginator,
    RouterLink,
  ],
  providers: [EventTypesStore],
  templateUrl: './all-event-types.component.html',
  styleUrl: './all-event-types.component.scss',
})
export class AllEventTypesComponent {
  public eventTypesStore = inject(EventTypesStore);
  private router = inject(Router);

  dataSource = new MatTableDataSource<EventTypeModel>();

  pageSizes = [10, 20, 50];

  displayedColumns: string[] = ['id', 'key', 'name', 'tags'];

  constructor() {
    effect(() => {
      this.dataSource.data = this.eventTypesStore.eventTypes();
    });
  }

  handleClick(row: EventTypeModel) {
    this.router.navigate([
      'project-management',
      'events',
      'event-types',
      row.id,
    ]);
  }
}
