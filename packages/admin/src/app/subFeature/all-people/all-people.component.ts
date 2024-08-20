import { Component, effect, inject } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { PeopleStore } from '@subFeature/all-people/people.store';
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
  ],
  providers: [PeopleStore],
  templateUrl: './all-people.component.html',
  styleUrl: './all-people.component.scss',
})
export class AllPeopleComponent {
  readonly peopleStore = inject(PeopleStore);

  pageSizes = [10, 20, 50];

  dataSource = new MatTableDataSource<PersonModel>();

  // TODO: Make this an object array that has display names, so headers aren't locked to the field name.
  displayedColumns: string[] = [
    'id',
    'familyName',
    'givenName',
    'personTypeId',
    'tags',
  ];

  constructor() {
    effect(() => {
      this.dataSource.data = this.peopleStore.people();
    });
  }

  handleClick(row: PersonModel) {
    console.log('row=', row);
  }
}
