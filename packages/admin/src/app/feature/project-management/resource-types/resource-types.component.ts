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
import { Router, RouterLink } from '@angular/router';
import { ErrorContainerComponent } from '../error-container/error-container.component';
import { ResourceTypesStore } from './resource-types.store';
import { ResourceTypeModel } from '@app/shared/models/resource-type.model';
import { MatSortModule, Sort } from '@angular/material/sort';

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
  ],
  providers: [ResourceTypesStore],
  templateUrl: './resource-types.component.html',
  styleUrl: './resource-types.component.scss',
})
export class ResourceTypesComponent {
  public resourceTypesStore = inject(ResourceTypesStore);
  private router = inject(Router);

  dataSource = new MatTableDataSource<ResourceTypeModel>();

  pageSizes = [10, 20, 50];

  displayedColumns: string[] = ['id', 'key', 'name', 'tags'];

  constructor() {
    effect(() => {
      this.dataSource.data = this.resourceTypesStore.resourceTypes();
    });
  }

  handleClick(row: ResourceTypeModel) {
    this.router.navigate(['project-management', 'resources', 'types', row.id]);
  }

  sortChange(event: Sort) {
    this.resourceTypesStore.load(
      this.resourceTypesStore.limit(),
      this.resourceTypesStore.offset(),
      event.active,
      event.direction,
      this.resourceTypesStore.pageIndex(),
    );
  }
}
