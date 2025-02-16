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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconButton } from '@angular/material/button';
import { FeatureStore } from '@app/shared/store/feature.store';
import { TagModel } from '@app/shared/models/tag.model';
import { TagsListStore } from './tags-list.store';
import { TableHeaderComponent } from '@app/shared/components/table-header/table-header.component';
import { RefreshService } from '@app/shared/services/refresh.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NoRecordsComponent } from '@app/shared/components/no-records/no-records.component';
import { buildBasicSearchForFeature } from '@app/shared/helpers/basic-search.helper';
import { FeatureSearchAndFilterStore } from '@app/shared/components/feature-search-and-filter/feature-search-and-filter.store';

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
    NoRecordsComponent,
  ],
  providers: [TagsListStore],
  templateUrl: './tags-list.component.html',
  styleUrl: './tags-list.component.scss',
})
export class TagsListComponent {
  readonly tagsListStore = inject(TagsListStore);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  readonly featureStore = inject(FeatureStore);
  readonly refreshService = inject(RefreshService);
  readonly featureSearchAndFilterStore = inject(FeatureSearchAndFilterStore);
  pageSizes = [10, 20, 50];

  dataSource = new MatTableDataSource<TagModel>();

  constructor() {
    effect(() => {
      this.dataSource.data = this.tagsListStore.tags();
    });

    this.refreshService.refreshTrigger$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.tagsListStore.load(
          this.tagsListStore.limit(),
          this.tagsListStore.offset(),
          this.tagsListStore.search(),
          this.tagsListStore.filters(),
        );
      });
  }

  // TODO: Make this an object array that has display names, so headers aren't locked to the field name.
  displayedColumns: string[] = ['pathname'];

  handleClick(row: TagModel) {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { detail_id: row.id },
    });
  }

  filtersChanged() {
    this.tagsListStore.load(
      this.tagsListStore.limit(),
      0,
      this.tagsListStore.search(),
      this.featureSearchAndFilterStore.filters(),
    );
  }

  filtersCleared() {
    this.tagsListStore.load(this.tagsListStore.limit(), 0, [], []);
  }

  searchTextChanged() {
    this.tagsListStore.load(
      this.tagsListStore.limit(),
      0,
      buildBasicSearchForFeature(
        'tags',
        this.featureSearchAndFilterStore.searchText(),
      ),
      this.tagsListStore.filters(),
    );
  }
}
