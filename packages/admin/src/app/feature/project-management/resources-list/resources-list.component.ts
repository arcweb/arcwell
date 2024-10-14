import { Component, effect, inject } from '@angular/core';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { ResourcesListStore } from '@feature/project-management/resources-list/resources-list.store';
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
import { ErrorContainerComponent } from '@feature/project-management/error-container/error-container.component';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { FeatureStore } from '@app/shared/store/feature.store';
import { MatSortModule, Sort } from '@angular/material/sort';
import { ResourcesTableComponent } from '@app/shared/components/resources-table/resources-table.component';
import { TableHeaderComponent } from '@app/shared/components/table-header/table-header.component';
import { RefreshService } from '@app/shared/services/refresh.service';

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
      this.resourcesListStore.load({
        limit: this.resourcesListStore.limit(),
        offset: 0,
        typeKey: typeKey,
      });
    });

    this.refreshService.refreshTrigger$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.resourcesListStore.load({
          limit: this.resourcesListStore.limit(),
          offset: this.resourcesListStore.offset(),
          typeKey: this.resourcesListStore.typeKey(),
        });
      });
  }

  rowClick(row: ResourceModel) {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { detail_id: row.id },
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
    });
  }
}
