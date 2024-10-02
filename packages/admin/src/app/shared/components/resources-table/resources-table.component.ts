import { Component, input, output } from '@angular/core';
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
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatSortModule, Sort, SortDirection } from '@angular/material/sort';
import { ResourceModel } from '@shared/models/resource.model';

@Component({
  selector: 'aw-resources-table',
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
    MatPaginator,
    MatIcon,
    MatIconButton,
    MatSortModule,
    MatButton,
  ],
  templateUrl: './resources-table.component.html',
  styleUrl: './resources-table.component.scss',
})
export class ResourcesTableComponent {
  dataSource = input.required<MatTableDataSource<ResourceModel>>();
  displayedColumns = input.required<string[]>();
  matSortActive = input.required<string>();
  matSortDirection = input.required<SortDirection>();
  length = input.required<number>();
  pageSizes = input.required<number[]>();
  pageSize = input.required<number>();
  pageIndex = input.required<number>();

  onPageChanged = output<PageEvent>();
  onRowClicked = output<ResourceModel>();
  onSortChanged = output<Sort>();

  pageChange(event: PageEvent) {
    this.onPageChanged.emit(event);
  }

  rowClick(row: ResourceModel) {
    this.onRowClicked.emit(row);
  }

  sortChange(event: Sort) {
    this.onSortChanged.emit(event);
  }
}
