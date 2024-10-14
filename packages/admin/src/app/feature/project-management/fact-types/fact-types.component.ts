import { Component, effect, inject } from '@angular/core';
import { FactTypesStore } from './fact-types.store';
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
import { FactTypeModel } from '@app/shared/models/fact-type.model';
import { ErrorContainerComponent } from '@feature/project-management/error-container/error-container.component';
import { JsonPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatPaginator } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { TableHeaderComponent } from '@app/shared/components/table-header/table-header.component';
@Component({
  selector: 'aw-fact-types',
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
  providers: [FactTypesStore],
  templateUrl: './fact-types.component.html',
  styleUrl: './fact-types.component.scss',
})
export class FactTypesComponent {
  public factTypesStore = inject(FactTypesStore);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  dataSource = new MatTableDataSource<FactTypeModel>();

  pageSizes = [10, 20, 50];

  displayedColumns: string[] = ['key', 'name', 'tags'];

  constructor() {
    effect(() => {
      this.dataSource.data = this.factTypesStore.factTypes();
    });
  }

  handleClick(row: FactTypeModel) {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { detail_id: row.id },
    });
  }

  sortChange(event: Sort) {
    this.factTypesStore.load({
      limit: this.factTypesStore.limit(),
      offset: this.factTypesStore.offset(),
      sort: event.active,
      order: event.direction,
      pageIndex: this.factTypesStore.pageIndex(),
    });
  }
}
