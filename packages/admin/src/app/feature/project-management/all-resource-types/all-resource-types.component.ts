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

@Component({
  selector: 'aw-all-resource-types',
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
  providers: [ResourceTypesStore],
  templateUrl: './all-resource-types.component.html',
  styleUrl: './all-resource-types.component.scss',
})
export class AllResourceTypesComponent {
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
    this.router.navigate([
      'project-management',
      'resources',
      'resource-types',
      row.id,
    ]);
  }
}
