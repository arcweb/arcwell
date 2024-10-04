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
import { FactModel } from '@shared/models/fact.model';
import { PersonModel } from '@app/shared/models/person.model';
import { UserModel } from '@app/shared/models';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'aw-users-table',
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
    MatIcon,
    MatIconButton,
    MatButton,
  ],
  templateUrl: './users-table.component.html',
  styleUrl: './users-table.component.scss',
})
export class UsersTableComponent {
  dataSource = input.required<MatTableDataSource<UserModel>>();
  displayedColumns = input.required<string[]>();
  length = input.required<number>();
  pageSizes = input.required<number[]>();
  pageSize = input.required<number>();
  pageIndex = input.required<number>();

  onPageChanged = output<PageEvent>();
  onRowClicked = output<UserModel>();
  onViewPersonClicked = output<string>();

  formatName(person: PersonModel) {
    return `${person.familyName}, ${person.givenName}`;
  }

  pageChange(event: PageEvent) {
    this.onPageChanged.emit(event);
  }

  rowClick(row: UserModel) {
    this.onRowClicked.emit(row);
  }

  viewPersonClick(personId: string) {
    this.onViewPersonClicked.emit(personId);
  }
}
