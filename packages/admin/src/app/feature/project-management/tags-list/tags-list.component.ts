import { JsonPipe } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
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
import { ErrorContainerComponent } from '../error-container/error-container.component';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { MatIconButton } from '@angular/material/button';
import { FeatureStore } from '@app/shared/store/feature.store';
import { TagModel } from '@app/shared/models/tag.model';
import { TagsListStore } from './tags-list.store';
import { TableHeaderComponent } from '@app/shared/components/table-header/table-header.component';

@Component({
  selector: 'aw-tags-list',
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
    TableHeaderComponent,
  ],
  providers: [TagsListStore],
  templateUrl: './tags-list.component.html',
  styleUrl: './tags-list.component.scss',
})
export class TagsListComponent {
  readonly tagsListStore = inject(TagsListStore);
  private router = inject(Router);
  readonly featureStore = inject(FeatureStore);
  pageSizes = [10, 20, 50];

  dataSource = new MatTableDataSource<TagModel>();

  constructor() {
    effect(() => {
      this.dataSource.data = this.tagsListStore.tags();
    });
  }

  // TODO: Make this an object array that has display names, so headers aren't locked to the field name.
  displayedColumns: string[] = ['pathname'];

  handleClick(row: TagModel) {
    this.router.navigate(['project-management', 'tags', row.id]);
  }
}
