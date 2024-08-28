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
import { ErrorContainerComponent } from '../../project-management/error-container/error-container.component';
import { MatIcon } from '@angular/material/icon';
import { MatPaginator } from '@angular/material/paginator';
import { JsonPipe } from '@angular/common';
import { PersonModel } from '@app/shared/models/person.model';

@Component({
  selector: 'aw-all-users',
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
  ],
  providers: [UsersStore],
  templateUrl: './all-users.component.html',
  styleUrl: './all-users.component.scss',
})
export class AllUsersComponent {
  readonly userStore = inject(UsersStore);
  private router = inject(Router);

  pageSizes = [10, 20, 50];

  dataSource = new MatTableDataSource<UserModel>();

  displayedColumns: string[] = ['id', 'email', 'role', 'person', 'tags'];

  constructor() {
    effect(() => {
      this.dataSource.data = this.userStore.users();
    });
  }

  handleClick(row: UserModel) {
    console.log('row=', row);
    this.router.navigate(['user-management', 'all-users', row.id]);
  }

  formatName(person: PersonModel) {
    return `${person.familyName}, ${person.givenName}`;
  }
}
