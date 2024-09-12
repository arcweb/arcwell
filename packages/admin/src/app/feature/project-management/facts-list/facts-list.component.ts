import { Component, effect, inject } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { FactsListStore } from '@feature/project-management/facts-list/facts-list.store';
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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ErrorContainerComponent } from '@feature/project-management/error-container/error-container.component';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { DateTime } from 'luxon';
import { convertDateTimeToLocal } from '@shared/helpers/date-format.helper';
import { FeatureStore } from '@app/shared/store/feature.store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

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
  providers: [FactsListStore],
  templateUrl: './facts-list.component.html',
  styleUrl: './facts-list.component.scss',
})
export class FactsListComponent {
  readonly factsListStore = inject(FactsListStore);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  readonly featureStore = inject(FeatureStore);
  typeKey$ = this.activatedRoute.params.pipe(
    takeUntilDestroyed(),
    map(({ typeKey }) => typeKey),
  );

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
      this.dataSource.data = this.factsListStore.facts();
    });
    // load the facts list based on the route parameters if they exist
    this.typeKey$.subscribe(typeKey => {
      this.factsListStore.load(this.factsListStore.limit(), 0, typeKey);
    });
  }

  handleClick(row: FactModel) {
    this.router.navigate(['project-management', 'facts', row.id]);
  }

  viewEvent(eventId: string) {
    this.router.navigate(['project-management', 'events', eventId]);
  }

  viewResource(resourceId: string) {
    this.router.navigate(['project-management', 'resources', resourceId]);
  }

  viewPerson(personId: string) {
    this.router.navigate(['project-management', 'people', personId]);
  }

  convertDateTimeToLocal(dateTime: DateTime | undefined): string {
    return convertDateTimeToLocal(dateTime);
  }
}
