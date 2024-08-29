import { Component, effect, inject } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { PeopleStore } from '@feature/project-management/all-people/people.store';
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
import { PersonModel } from '@shared/models/person.model';
import { MatPaginator } from '@angular/material/paginator';
import { Router, RouterLink } from '@angular/router';
import { ErrorContainerComponent } from '@feature/project-management/error-container/error-container.component';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';

@Component({
  selector: 'aw-all-people',
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
  providers: [PeopleStore],
  templateUrl: './all-people.component.html',
  styleUrl: './all-people.component.scss',
})
export class AllPeopleComponent {
  readonly peopleStore = inject(PeopleStore);
  private router = inject(Router);

  pageSizes = [10, 20, 50];

  dataSource = new MatTableDataSource<PersonModel>();

  // TODO: Make this an object array that has display names, so headers aren't locked to the field name.
  displayedColumns: string[] = [
    'id',
    'familyName',
    'givenName',
    'personType',
    'tags',
    'user',
  ];

  constructor() {
    effect(() => {
      this.dataSource.data = this.peopleStore.people();
    });
  }

  handleClick(row: PersonModel) {
    console.log(row);
    this.router.navigate([
      'project-management',
      'people',
      'all-people',
      row.id,
    ]);
  }

  viewAccount(personId: string) {
    console.log(personId);
    this.router.navigate(['user-management', 'all-users', personId]);
  }
}
