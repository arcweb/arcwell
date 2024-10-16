import { JsonPipe } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatPaginator } from '@angular/material/paginator';
import {
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
  MatTableDataSource,
} from '@angular/material/table';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ErrorContainerComponent } from '../error-container/error-container.component';
import { ResourceTypesStore } from './resource-types.store';
import { ResourceTypeModel } from '@app/shared/models/resource-type.model';
import { MatSortModule, Sort } from '@angular/material/sort';
import { TableHeaderComponent } from '@app/shared/components/table-header/table-header.component';
import { RefreshService } from '@app/shared/services/refresh.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NoRecordsComponent } from '@app/shared/components/no-records/no-records.component';

@Component({
  selector: 'aw-resource-types',
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
    MatSortModule,
    TableHeaderComponent,
    NoRecordsComponent,
  ],
  providers: [ResourceTypesStore],
  templateUrl: './resource-types.component.html',
  styleUrl: './resource-types.component.scss',
})
export class ResourceTypesComponent {
  public resourceTypesStore = inject(ResourceTypesStore);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  readonly refreshService = inject(RefreshService);

  dataSource = new MatTableDataSource<ResourceTypeModel>();

  pageSizes = [10, 20, 50];

  displayedColumns: string[] = ['key', 'name', 'tags'];

  constructor() {
    effect(() => {
      this.dataSource.data = this.resourceTypesStore.resourceTypes();
    });

    this.refreshService.refreshTrigger$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.resourceTypesStore.load({
          limit: this.resourceTypesStore.limit(),
          offset: this.resourceTypesStore.offset(),
          sort: this.resourceTypesStore.sort(),
          order: this.resourceTypesStore.order(),
          pageIndex: this.resourceTypesStore.pageIndex(),
        });
      });
  }

  handleClick(row: ResourceTypeModel) {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { detail_id: row.id },
    });
  }

  sortChange(event: Sort) {
    this.resourceTypesStore.load({
      limit: this.resourceTypesStore.limit(),
      offset: this.resourceTypesStore.offset(),
      sort: event.active,
      order: event.direction,
      pageIndex: this.resourceTypesStore.pageIndex(),
    });
  }
}
