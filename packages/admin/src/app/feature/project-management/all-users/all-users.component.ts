import { Component, effect, inject } from '@angular/core';
import { UserStore } from './users.store';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { UserModel } from '@app/shared/models';

@Component({
  selector: 'aw-all-users',
  standalone: true,
  imports: [],
  providers: [UserStore],
  templateUrl: './all-users.component.html',
  styleUrl: './all-users.component.scss',
})
export class AllUsersComponent {
  readonly userStore = inject(UserStore);
  private router = inject(Router);

  pageSizes = [10, 20, 50];

  dataSource = new MatTableDataSource<UserModel>();

  displayedColumns: string[] = ['id', 'email', 'role', 'person'];

  constructor() {
    effect(() => {
      this.dataSource.data = this.userStore.users();
    });
  }

  handleClick(row: UserModel) {
    console.log('row=', row);
    // this.router.navigate(['project-management', 'users', 'all-users', row.id]);
  }
}
