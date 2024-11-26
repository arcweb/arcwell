import { Component, effect, inject } from '@angular/core';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { ResourcesListStore } from '@feature/resources-list/resources-list.store';
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
import { ResourceModel } from '@shared/models/resource.model';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ErrorContainerComponent } from '@app/feature/error-container/error-container.component';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { FeatureStore } from '@app/shared/store/feature.store';
import { MatSortModule, Sort } from '@angular/material/sort';
import { ResourcesTableComponent } from '@app/shared/components/resources-table/resources-table.component';
import { TableHeaderComponent } from '@app/shared/components/table-header/table-header.component';
import { RefreshService } from '@app/shared/services/refresh.service';
import { NoRecordsComponent } from '@app/shared/components/no-records/no-records.component';
import { MatDialog } from '@angular/material/dialog';
import { BulkImportDialogComponent } from '@app/shared/components/dialogs/bulk-import/bulk-import-dialog.component';
import { FeatureSearchAndFilterStore } from '@app/shared/components/feature-search-and-filter/feature-search-and-filter.store';
import { buildBasicSearchForFeature } from '@app/shared/helpers/basic-search.helper';
import { FeatureFilter } from '@app/shared/interfaces/feature-filter';

@Component({
  selector: 'aw-resources-list',
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
    ResourcesTableComponent,
    TableHeaderComponent,
    NoRecordsComponent,
  ],
  providers: [ResourcesListStore],
  templateUrl: './resources-list.component.html',
  styleUrl: './resources-list.component.scss',
})
export class ResourcesListComponent {
  readonly resourcesListStore = inject(ResourcesListStore);
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

  dataSource = new MatTableDataSource<ResourceModel>();

  // TODO: Make this an object array that has display names, so headers aren't locked to the field name.
  displayedColumns: string[] = ['name', 'resourceType', 'tags'];

  constructor() {
    effect(() => {
      this.dataSource.data = this.resourcesListStore.resources();
    });
    // load the resources list based on the route parameters if they exist
    this.typeKey$.subscribe(typeKey => {
      // Check if the search/filter store has filters set for the current feature type. If so,
      // set search/filters. This typekey pipe fires before the navigation pipe in features-menu.component.ts
      // that flushes the filterstore if the feature changed, so the feature type must be checked against
      // here.
      let search: { field: string; searchString: string }[] = [];
      let filters: FeatureFilter[] = [];
      if (
        this.featureSearchAndFilterStore.currentFeature() == 'resources' &&
        this.featureSearchAndFilterStore.currentSubFeature() != 'types'
      ) {
        if (this.featureSearchAndFilterStore.searchText().length > 0) {
          search = buildBasicSearchForFeature(
            'resources',
            this.featureSearchAndFilterStore.searchText(),
          );
        }
        if (this.featureSearchAndFilterStore.filters().length > 0) {
          filters = this.featureSearchAndFilterStore.filters();
        }
      }
      this.resourcesListStore.load({
        limit: this.resourcesListStore.limit(),
        offset: 0,
        typeKey,
        search,
        filters,
      });
    });

    this.refreshService.refreshTrigger$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.resourcesListStore.load({
          limit: this.resourcesListStore.limit(),
          offset: this.resourcesListStore.offset(),
          typeKey: this.resourcesListStore.typeKey(),
          search: this.resourcesListStore.search(),
          filters: this.resourcesListStore.filters(),
        });
      });
  }

  rowClick(row: ResourceModel) {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { detail_id: row.id },
    });
  }

  filtersChanged() {
    this.resourcesListStore.load({
      limit: this.resourcesListStore.limit(),
      offset: 0,
      typeKey: this.resourcesListStore.typeKey(),
      search: this.resourcesListStore.search(),
      filters: this.featureSearchAndFilterStore.filters(),
    });
  }

  filtersCleared() {
    this.resourcesListStore.load({
      limit: this.resourcesListStore.limit(),
      offset: 0,
      typeKey: this.resourcesListStore.typeKey(),
      search: [],
      filters: [],
    });
  }

  searchTextChanged() {
    this.resourcesListStore.load({
      limit: this.resourcesListStore.limit(),
      offset: 0,
      typeKey: this.resourcesListStore.typeKey(),
      search: buildBasicSearchForFeature(
        'resources',
        this.featureSearchAndFilterStore.searchText(),
      ),
      filters: this.resourcesListStore.filters(),
    });
  }

  sortChange(event: Sort) {
    this.resourcesListStore.load({
      limit: this.resourcesListStore.limit(),
      offset: this.resourcesListStore.offset(),
      sort: event.active,
      order: event.direction,
      pageIndex: this.resourcesListStore.pageIndex(),
      typeKey: this.resourcesListStore.typeKey(),
      search: this.resourcesListStore.search(),
      filters: this.resourcesListStore.filters(),
    });
  }

  bulkImport() {
    this.dialog.open(BulkImportDialogComponent, {
      data: {
        title: 'Import Resources',
        types: this.resourcesListStore.resourceTypes(),
        apiRoute: 'resources',
      },
    });
  }
}
