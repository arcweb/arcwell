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
import { TableHeaderComponent } from '@app/shared/components/table-header/table-header.component';
import { RefreshService } from '@app/shared/services/refresh.service';
import { NoRecordsComponent } from '@app/shared/components/no-records/no-records.component';
import { MatDialog } from '@angular/material/dialog';
import { BulkImportDialogComponent } from '@app/shared/components/dialogs/bulk-import/bulk-import-dialog.component';
import { FeatureFilter } from '@app/shared/interfaces/feature-filter';
import { FeatureSearchAndFilterStore } from '@app/shared/components/feature-search-and-filter/feature-search-and-filter.store';

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
    TableHeaderComponent,
    NoRecordsComponent,
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
  readonly refreshService = inject(RefreshService);
  readonly dialog = inject(MatDialog);
  readonly featureSearchAndFilterStore = inject(FeatureSearchAndFilterStore);
  typeKey$ = this.activatedRoute.params.pipe(
    takeUntilDestroyed(),
    map(({ type_key: typeKey }) => typeKey),
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
      // Check if the filter store has filters set for the current feature type. If so,
      // set filters. This typekey pipe fires before the navigation pipe in features-menu.component.ts
      // that flushes the filterstore if the feature changed, so the feature type must be checked against
      // here.
      let filters: FeatureFilter[] = [];
      if (
        this.featureSearchAndFilterStore.currentFeature() == 'events' &&
        this.featureSearchAndFilterStore.currentSubFeature() != 'types' &&
        this.featureSearchAndFilterStore.filters().length > 0
      ) {
        filters = this.featureSearchAndFilterStore.filters();
      }
      this.eventsListStore.load({
        limit: this.eventsListStore.limit(),
        offset: 0,
        typeKey,
        filters,
      });
    });

    this.refreshService.refreshTrigger$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.eventsListStore.load({
          limit: this.eventsListStore.limit(),
          offset: this.eventsListStore.offset(),
          typeKey: this.eventsListStore.typeKey(),
          filters: this.eventsListStore.filters(),
        });
      });
  }

  rowClick(row: EventModel) {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { detail_id: row.id },
    });
  }

  filtersChanged() {
    this.eventsListStore.load({
      limit: this.eventsListStore.limit(),
      offset: 0,
      typeKey: this.eventsListStore.typeKey(),
      filters: this.featureSearchAndFilterStore.filters(),
    });
  }

  filtersCleared() {
    this.eventsListStore.load({
      limit: this.eventsListStore.limit(),
      offset: 0,
      typeKey: this.eventsListStore.typeKey(),
      filters: [],
    });
  }

  sortChange(event: Sort) {
    this.eventsListStore.load({
      limit: this.eventsListStore.limit(),
      offset: this.eventsListStore.offset(),
      sort: event.active,
      order: event.direction,
      pageIndex: this.eventsListStore.pageIndex(),
      typeKey: this.eventsListStore.typeKey(),
      filters: this.eventsListStore.filters(),
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

  bulkImport() {
    this.dialog.open(BulkImportDialogComponent, {
      data: {
        title: 'Import Events',
        types: this.eventsListStore.eventTypes(),
        apiRoute: 'events',
      },
    });
  }
}
