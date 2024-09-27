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
import { CohortModel } from '@shared/models/cohort.model';

@Component({
  selector: 'aw-cohort-table',
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
    MatButton,
  ],
  templateUrl: './cohort-table.component.html',
  styleUrl: './cohort-table.component.scss',
})
export class CohortTableComponent {
  dataSource = input.required<MatTableDataSource<CohortModel>>();
  displayedColumns = input.required<string[]>();
  length = input.required<number>();
  pageSizes = input.required<number[]>();
  pageSize = input.required<number>();
  pageIndex = input.required<number>();

  onDeleteClicked = output<string>();
  onPageChanged = output<PageEvent>();
  onRowClicked = output<CohortModel>();

  pageChange(event: PageEvent) {
    this.onPageChanged.emit(event);
  }

  rowClick(row: CohortModel) {
    this.onRowClicked.emit(row);
  }

  deleteClick(cohortId: string) {
    this.onDeleteClicked.emit(cohortId);
  }
}
