import { Component, effect, inject } from '@angular/core';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { ResourcesListStore } from '@feature/project-management/resources-list/resources-list.store';
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
import { ResourceModel } from '@shared/models/resource.model';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ErrorContainerComponent } from '@feature/project-management/error-container/error-container.component';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { FeatureStore } from '@app/shared/store/feature.store';
import { MatSortModule, Sort } from '@angular/material/sort';

@Component({
  selector: 'aw-resources-list',
  standalone: true,
  imports: [
    AsyncPipe,
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
    MatSortModule,
  ],
  providers: [ResourcesListStore],
  templateUrl: './resources-list.component.html',
  styleUrl: './resources-list.component.scss',
})
export class ResourcesListComponent {
  readonly resourcesListStore = inject(ResourcesListStore);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  readonly featureStore = inject(FeatureStore);
  typeKey$ = this.activatedRoute.params.pipe(
    takeUntilDestroyed(),
    map(({ typeKey }) => typeKey),
  );

  pageSizes = [10, 20, 50];

  dataSource = new MatTableDataSource<ResourceModel>();

  // TODO: Make this an object array that has display names, so headers aren't locked to the field name.
  displayedColumns: string[] = ['name', 'resourceType', 'tags'];

  constructor() {
    effect(() => {
      this.dataSource.data = this.resourcesListStore.resources();
    });
    // load the resources list based on the route parameters if they exist
    this.typeKey$.subscribe(typeKey => {
      this.resourcesListStore.load(
        this.resourcesListStore.limit(),
        0,
        '',
        '',
        0,
        typeKey,
      );
    });
  }

  handleClick(row: ResourceModel) {
    this.router.navigate(['project-management', 'resources', row.id]);
  }

  sortChange(event: Sort) {
    this.resourcesListStore.load(
      this.resourcesListStore.limit(),
      this.resourcesListStore.offset(),
      event.active,
      event.direction,
      this.resourcesListStore.pageIndex(),
      this.resourcesListStore.typeKey(),
    );
  }
}
