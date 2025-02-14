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
import { GroupModel } from '@app/shared/models/group.model';
import { GroupsListStore } from './groups-list.store';
import { TableHeaderComponent } from '@app/shared/components/table-header/table-header.component';
import { RefreshService } from '@app/shared/services/refresh.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NoRecordsComponent } from '@app/shared/components/no-records/no-records.component';
import { buildBasicSearchForFeature } from '@app/shared/helpers/basic-search.helper';

@Component({
  selector: 'aw-groups-list',
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
  providers: [GroupsListStore],
  templateUrl: './groups-list.component.html',
  styleUrl: './groups-list.component.scss',
})
export class GroupsListComponent {
  readonly groupsListStore = inject(GroupsListStore);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  readonly featureStore = inject(FeatureStore);
  readonly refreshService = inject(RefreshService);
  pageSizes = [10, 20, 50];

  dataSource = new MatTableDataSource<GroupModel>();

  constructor() {
    effect(() => {
      this.dataSource.data = this.groupsListStore.groups();
    });

    this.refreshService.refreshTrigger$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.groupsListStore.load(
          this.groupsListStore.limit(),
          this.groupsListStore.offset(),
          this.groupsListStore.search(),
        );
      });
  }

  // TODO: Make this an object array that has display names, so headers aren't locked to the field name.
  displayedColumns: string[] = ['name'];

  handleClick(row: GroupModel) {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { detail_id: row.id },
    });
  }

  searchTextChanged(searchText: string) {
    this.groupsListStore.load(
      this.groupsListStore.limit(),
      0,
      buildBasicSearchForFeature('groups', searchText),
    );
  }
}
