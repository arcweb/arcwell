import { Component, effect, inject } from '@angular/core';
import { PersonTypesStore } from './person-types.store';
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
import { Router } from '@angular/router';
import { PersonTypeModel } from '@app/shared/models/person-type.model';
import { ErrorContainerComponent } from '@feature/project-management/error-container/error-container.component';

@Component({
  selector: 'aw-person-types',
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
    ErrorContainerComponent,
  ],
  providers: [PersonTypesStore],
  templateUrl: './person-types.component.html',
  styleUrl: './person-types.component.scss',
})
export class PersonTypesComponent {
  public personTypesStore = inject(PersonTypesStore);
  private router = inject(Router);

  dataSource = new MatTableDataSource<PersonTypeModel>();

  pageSizes = [10, 20, 50];

  displayedColumns: string[] = ['id', 'key', 'name', 'info', 'tags'];

  constructor() {
    this.personTypesStore.getPersonTypes();
    effect(() => {
      this.dataSource.data = this.personTypesStore.personTypes();
    });
  }
}
