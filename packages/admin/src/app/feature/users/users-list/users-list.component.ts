import { Component, effect, inject } from '@angular/core';
import { UsersStore } from './users.store';
import { ActivatedRoute, Router } from '@angular/router';
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
import { MatIcon } from '@angular/material/icon';
import { MatPaginator } from '@angular/material/paginator';
import { JsonPipe } from '@angular/common';
import { UsersTableComponent } from '@app/shared/components/users-table/users-table.component';
import { TableHeaderComponent } from '@app/shared/components/table-header/table-header.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@app/shared/components/dialogs/confirmation/confirmation-dialog.component';
import { ErrorContainerComponent } from '@feature/error-container/error-container.component';
import { RefreshService } from '@app/shared/services/refresh.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  private activatedRoute = inject(ActivatedRoute);
  readonly refreshService = inject(RefreshService);

  pageSizes = [10, 20, 50];

  dataSource = new MatTableDataSource<UserModel>();

  displayedColumns: string[] = ['email', 'role', 'person', 'tags', 'reinvite'];

  constructor() {
    effect(() => {
      this.dataSource.data = this.userStore.users();
    });

    this.refreshService.refreshTrigger$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.userStore.load(this.userStore.limit(), this.userStore.offset());
      });
  }

  rowClick(row: UserModel) {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { detail_id: row.id },
    });
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
        this.userStore.invite(row.id, location.origin);
      }
    });
  }

  viewPerson(personId: string) {
    this.router.navigate(['people', 'list'], {
      queryParams: { detail_id: personId },
    });
  }
}
