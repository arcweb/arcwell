import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { TableHeaderComponent } from '@app/shared/components/table-header/table-header.component';
import { RefreshService } from '@app/shared/services/refresh.service';
import { FeatureStore } from '@app/shared/store/feature.store';
import { map } from 'rxjs';
import { FilesListStore } from './file-list.store';
import { AsyncPipe } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { FileModel } from '@app/shared/models/file.model';
import { ErrorContainerComponent } from '../error-container/error-container.component';
import { NoRecordsComponent } from '@app/shared/components/no-records/no-records.component';
import { FilesTableComponent } from '@app/shared/components/files-table/files-table.component';
import { Sort } from '@angular/material/sort';

@Component({
  selector: 'aw-file-list',
  standalone: true,
  imports: [
    AsyncPipe,
    ErrorContainerComponent,
    FilesTableComponent,
    NoRecordsComponent,
    TableHeaderComponent,
  ],
  providers: [FilesListStore],
  templateUrl: './file-list.component.html',
  styleUrl: './file-list.component.scss',
})
export class FileListComponent {
  readonly filesListStore = inject(FilesListStore);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  readonly featureStore = inject(FeatureStore);
  readonly refreshService = inject(RefreshService);
  readonly dialog = inject(MatDialog);
  typeKey$ = this.activatedRoute.params.pipe(
    takeUntilDestroyed(),
    map(({ type_key: typeKey }) => typeKey),
  );

  pageSizes = [10, 20, 50];

  dataSource = new MatTableDataSource<FileModel>();

  displayedColumns: string[] = ['fileType', 'name', 'url', 'createdAt'];

  bulkImport() {
    throw new Error('Method not implemented.');
  }

  rowClick($event: FileModel) {
    throw new Error('Method not implemented.');
  }
  sortChange($event: Sort) {
    throw new Error('Method not implemented.');
  }
  viewEvent($event: string) {
    throw new Error('Method not implemented.');
  }
  viewResource($event: string) {
    throw new Error('Method not implemented.');
  }
  viewPerson($event: string) {
    throw new Error('Method not implemented.');
  }
}
