import { Component, effect, inject } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { ResourcesStore } from '@feature/project-management/all-resources/resources.store';
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
import { Router, RouterLink } from '@angular/router';
import { ErrorContainerComponent } from '@feature/project-management/error-container/error-container.component';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';

@Component({
  selector: 'aw-all-resources',
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
  ],
  providers: [ResourcesStore],
  templateUrl: './all-resources.component.html',
  styleUrl: './all-resources.component.scss',
})
export class AllResourcesComponent {
  readonly resourcesStore = inject(ResourcesStore);
  private router = inject(Router);

  pageSizes = [10, 20, 50];

  dataSource = new MatTableDataSource<ResourceModel>();

  // TODO: Make this an object array that has display names, so headers aren't locked to the field name.
  displayedColumns: string[] = ['id', 'name', 'resourceType', 'tags'];

  constructor() {
    effect(() => {
      this.dataSource.data = this.resourcesStore.resources();
    });
  }

  handleClick(row: ResourceModel) {
    this.router.navigate([
      'project-management',
      'resources',
      'all-resources',
      row.id,
    ]);
  }
}
