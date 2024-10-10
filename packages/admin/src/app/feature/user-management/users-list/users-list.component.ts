import { Component, effect, inject } from '@angular/core';
import { UsersStore } from './users.store';
import { Router } from '@angular/router';
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
import { UserModel } from '@app/shared/models';
import { ErrorContainerComponent } from '../../error-container/error-container.component';
import { MatIcon } from '@angular/material/icon';
import { MatPaginator } from '@angular/material/paginator';
import { JsonPipe } from '@angular/common';
import { UsersTableComponent } from '@app/shared/components/users-table/users-table.component';
import { TableHeaderComponent } from '@app/shared/components/table-header/table-header.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@app/shared/components/dialogs/confirmation/confirmation-dialog.component';

@Component({
  selector: 'aw-users-list',
  standalone: true,
  imports: [
    JsonPipe,
    ErrorContainerComponent,
    MatIcon,
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
    UsersTableComponent,
    TableHeaderComponent,
  ],
  providers: [UsersStore],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss',
})
export class AllUsersComponent {
  readonly dialog = inject(MatDialog);
  readonly userStore = inject(UsersStore);
  private router = inject(Router);

  pageSizes = [10, 20, 50];

  dataSource = new MatTableDataSource<UserModel>();

  displayedColumns: string[] = ['email', 'role', 'person', 'tags', 'reinvite'];

  constructor() {
    effect(() => {
      this.dataSource.data = this.userStore.users();
    });
  }

  rowClick(row: UserModel) {
    this.router.navigate(['settings', 'user-management', row.id]);
  }

  reinvite(row: UserModel) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Re-Invite this person?',
        question:
          'Would you like to send this Person an email with instructions on how to log in? This will require the person to reset their password when they log in next.',
        okButton: 'Invite',
        cancelButtonText: "Don't Invite",
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true && row.id) {
        this.userStore.invite(row.id);
      }
    });
  }

  viewPerson(personId: string) {
    this.router.navigate(['people', 'list', personId]);
  }
}
