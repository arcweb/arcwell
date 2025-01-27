import { Component, effect, inject } from '@angular/core';
import { FileTypesStore } from './file-types.store';
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
import { FileTypeModel } from '@app/shared/models/file-type.model';
import { ErrorContainerComponent } from '@app/feature/error-container/error-container.component';
import { JsonPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatPaginator } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { TableHeaderComponent } from '@app/shared/components/table-header/table-header.component';
import { RefreshService } from '@app/shared/services/refresh.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NoRecordsComponent } from '@app/shared/components/no-records/no-records.component';
import { buildBasicSearchForFeature } from '@app/shared/helpers/basic-search.helper';

@Component({
  selector: 'aw-file-types',
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
    NoRecordsComponent,
  ],
  providers: [FileTypesStore],
  templateUrl: './file-types.component.html',
  styleUrl: './file-types.component.scss',
})
export class FileTypesComponent {
  public fileTypesStore = inject(FileTypesStore);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  readonly refreshService = inject(RefreshService);

  dataSource = new MatTableDataSource<FileTypeModel>();

  pageSizes = [10, 20, 50];

  displayedColumns: string[] = ['key', 'name', 'tags'];

  constructor() {
    effect(() => {
      this.dataSource.data = this.fileTypesStore.fileTypes();
    });
    this.refreshService.refreshTrigger$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.fileTypesStore.load({
          limit: this.fileTypesStore.limit(),
          offset: this.fileTypesStore.offset(),
          sort: this.fileTypesStore.sort(),
          order: this.fileTypesStore.order(),
          pageIndex: this.fileTypesStore.pageIndex(),
          search: this.fileTypesStore.search(),
        });
      });
  }

  handleClick(row: FileTypeModel) {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { detail_id: row.id },
    });
  }

  searchTextChanged(searchText: string) {
    this.fileTypesStore.load({
      limit: this.fileTypesStore.limit(),
      offset: 0,
      search: buildBasicSearchForFeature('file_types', searchText),
    });
  }

  sortChange(event: Sort) {
    this.fileTypesStore.load({
      limit: this.fileTypesStore.limit(),
      offset: this.fileTypesStore.offset(),
      sort: event.active,
      order: event.direction,
      pageIndex: this.fileTypesStore.pageIndex(),
      search: this.fileTypesStore.search(),
    });
  }
}
