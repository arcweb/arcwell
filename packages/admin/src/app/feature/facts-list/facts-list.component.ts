import { Component, effect, inject } from '@angular/core';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { FactsListStore } from '@feature/facts-list/facts-list.store';
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
import { ErrorContainerComponent } from '@app/feature/error-container/error-container.component';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { FeatureStore } from '@app/shared/store/feature.store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { MatSortModule, Sort } from '@angular/material/sort';
import { FactsTableComponent } from '@app/shared/components/facts-table/facts-table.component';
import { TableHeaderComponent } from '@app/shared/components/table-header/table-header.component';
import { RefreshService } from '@app/shared/services/refresh.service';
import { NoRecordsComponent } from '@app/shared/components/no-records/no-records.component';

@Component({
  selector: 'aw-all-facts',
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
    MatButton,
    MatSortModule,
    FactsTableComponent,
    TableHeaderComponent,
    NoRecordsComponent,
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
  readonly refreshService = inject(RefreshService);
  typeKey$ = this.activatedRoute.params.pipe(
    takeUntilDestroyed(),
    map(({ type_key: typeKey }) => typeKey),
  );

  pageSizes = [10, 20, 50];

  dataSource = new MatTableDataSource<FactModel>();

  // TODO: Make this an object array that has display names, so headers aren't locked to the field name.
  displayedColumns: string[] = [
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
      this.factsListStore.load({
        limit: this.factsListStore.limit(),
        offset: 0,
        typeKey: typeKey,
      });
    });

    this.refreshService.refreshTrigger$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.factsListStore.load({
          limit: this.factsListStore.limit(),
          offset: this.factsListStore.offset(),
          typeKey: this.factsListStore.typeKey(),
        });
      });
  }

  rowClick(row: FactModel) {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { detail_id: row.id },
    });
  }

  viewEvent(eventId: string) {
    this.router.navigate(['events', 'list'], {
      queryParams: { detail_id: eventId },
    });
  }

  viewResource(resourceId: string) {
    this.router.navigate(['resources', 'list'], {
      queryParams: { detail_id: resourceId },
    });
  }

  viewPerson(personId: string) {
    this.router.navigate(['people', 'list'], {
      queryParams: { detail_id: personId },
    });
  }

  sortChange(event: Sort) {
    this.factsListStore.load({
      limit: this.factsListStore.limit(),
      offset: this.factsListStore.offset(),
      sort: event.active,
      order: event.direction,
      pageIndex: this.factsListStore.pageIndex(),
      typeKey: this.factsListStore.typeKey(),
    });
  }
}
