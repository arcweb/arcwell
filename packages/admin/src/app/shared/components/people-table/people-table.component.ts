import { Component, effect, inject, input, OnInit, output, } from '@angular/core';
import { PeopleListStore } from '@feature/project-management/people-list/people-list.store';
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
import { MatIconButton } from '@angular/material/button';
import { MatSortModule, Sort, SortDirection } from '@angular/material/sort';
import { PersonModel } from '@shared/models/person.model';

@Component({
  selector: 'aw-people-table',
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
  ],
  templateUrl: './people-table.component.html',
  styleUrl: './people-table.component.scss',
})
export class PeopleTableComponent {
  dataSource = input.required<MatTableDataSource<PersonModel>>();
  displayedColumns = input.required<string[]>();
  matSortActive = input.required<string>();
  matSortDirection = input.required<SortDirection>();
  length = input.required<number>();
  pageSizes = input.required<number[]>();
  pageSize = input.required<number>();
  pageIndex = input.required<number>();

  onDeleteClicked = output<string>();
  onPageChanged = output<PageEvent>();
  onRowClicked = output<PersonModel>();
  onSortChanged = output<Sort>();
  onViewAccountClicked = output<string>();

  pageChange(event: PageEvent) {
    this.onPageChanged.emit(event);
  }

  rowClick(row: PersonModel) {
    this.onRowClicked.emit(row);
  }

  sortChange(event: Sort) {
    this.onSortChanged.emit(event);
  }

  viewAccountClick(personId: string) {
    this.onViewAccountClicked.emit(personId);
  }

  deleteClick(personId: string) {
    this.onDeleteClicked.emit(personId);
  }
}
