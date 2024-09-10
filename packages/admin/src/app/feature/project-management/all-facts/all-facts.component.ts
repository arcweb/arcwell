import { Component, effect, inject } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { FactsStore } from '@feature/project-management/all-facts/facts.store';
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
import { FactModel } from '@shared/models/fact.model';
import { MatPaginator } from '@angular/material/paginator';
import { Router, RouterLink } from '@angular/router';
import { ErrorContainerComponent } from '@feature/project-management/error-container/error-container.component';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { DateTime } from 'luxon';
import { convertDateTimeToLocal } from '@shared/helpers/date-format.helper';

@Component({
  selector: 'aw-all-facts',
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
    MatButton,
  ],
  providers: [FactsStore],
  templateUrl: './all-facts.component.html',
  styleUrl: './all-facts.component.scss',
})
export class AllFactsComponent {
  readonly factsStore = inject(FactsStore);
  private router = inject(Router);

  pageSizes = [10, 20, 50];

  dataSource = new MatTableDataSource<FactModel>();

  // TODO: Make this an object array that has display names, so headers aren't locked to the field name.
  displayedColumns: string[] = [
    'id',
    'factType',
    'person',
    'resource',
    'event',
    'observedAt',
    'tags',
  ];

  constructor() {
    effect(() => {
      this.dataSource.data = this.factsStore.facts();
    });
  }

  handleClick(row: FactModel) {
    this.router.navigate(['project-management', 'facts', 'all-facts', row.id]);
  }

  viewEvent(eventId: string) {
    this.router.navigate([
      'project-management',
      'events',
      'all-events',
      eventId,
    ]);
  }

  viewResource(resourceId: string) {
    this.router.navigate([
      'project-management',
      'resources',
      'all-resources',
      resourceId,
    ]);
  }

  viewPerson(personId: string) {
    this.router.navigate([
      'project-management',
      'people',
      'all-people',
      personId,
    ]);
  }

  convertDateTimeToLocal(dateTime: DateTime | undefined): string {
    return convertDateTimeToLocal(dateTime);
  }
}
