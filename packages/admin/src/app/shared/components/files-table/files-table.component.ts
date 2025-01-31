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
import { FileModel } from '@shared/models/file.model';
import { convertDateTimeToLocal } from '@shared/helpers/date-format.helper';
import { DateTime } from 'luxon';

@Component({
  selector: 'aw-files-table',
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
  templateUrl: './files-table.component.html',
  styleUrl: './files-table.component.scss',
})
export class FilesTableComponent {
  dataSource = input.required<MatTableDataSource<FileModel>>();
  displayedColumns = input.required<string[]>();
  matSortActive = input.required<string>();
  matSortDirection = input.required<SortDirection>();
  length = input.required<number>();
  pageSizes = input.required<number[]>();
  pageSize = input.required<number>();
  pageIndex = input.required<number>();

  onPageChanged = output<PageEvent>();
  onRowClicked = output<FileModel>();
  onSortChanged = output<Sort>();

  convertDateTimeToLocal(dateTime: DateTime | undefined): string {
    return convertDateTimeToLocal(dateTime);
  }

  pageChange(event: PageEvent) {
    this.onPageChanged.emit(event);
  }

  rowClick(row: FileModel) {
    this.onRowClicked.emit(row);
  }

  sortChange(event: Sort) {
    this.onSortChanged.emit(event);
  }
}
