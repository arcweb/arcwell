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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PersonTypeModel } from '@app/shared/models/person-type.model';
import { ErrorContainerComponent } from '@feature/project-management/error-container/error-container.component';
import { JsonPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatPaginator } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { TableHeaderComponent } from '../../../shared/components/table-header/table-header.component';

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
    JsonPipe,
    MatIcon,
    MatIconButton,
    MatPaginator,
    RouterLink,
    MatSortModule,
    TableHeaderComponent,
  ],
  providers: [PersonTypesStore],
  templateUrl: './person-types.component.html',
  styleUrl: './person-types.component.scss',
})
export class PersonTypesComponent {
  public personTypesStore = inject(PersonTypesStore);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  dataSource = new MatTableDataSource<PersonTypeModel>();

  pageSizes = [10, 20, 50];

  displayedColumns: string[] = ['key', 'name', 'tags'];

  constructor() {
    effect(() => {
      this.dataSource.data = this.personTypesStore.personTypes();
    });
  }

  handleClick(row: PersonTypeModel) {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { detail_id: row.id },
    });
  }

  sortChange(event: Sort) {
    this.personTypesStore.load({
      limit: this.personTypesStore.limit(),
      offset: this.personTypesStore.offset(),
      sort: event.active,
      order: event.direction,
      pageIndex: this.personTypesStore.pageIndex(),
    });
  }
}
