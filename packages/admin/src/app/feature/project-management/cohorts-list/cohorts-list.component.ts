import { Component, effect, inject } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { CohortsListStore } from '@feature/project-management/cohorts-list/cohorts-list.store';
import { MatTableDataSource } from '@angular/material/table';
import { CohortModel } from '@shared/models/cohort.model';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ErrorContainerComponent } from '@feature/project-management/error-container/error-container.component';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { FeatureStore } from '@app/shared/store/feature.store';
import { CohortTableComponent } from '@app/shared/components/cohort-table/cohort-table.component';
import { TableHeaderComponent } from '@app/shared/components/table-header/table-header.component';
@Component({
  selector: 'aw-cohorts-list',
  standalone: true,
  imports: [
    JsonPipe,
    ErrorContainerComponent,
    MatIcon,
    RouterLink,
    MatIconButton,
    CohortTableComponent,
    TableHeaderComponent,
  ],
  providers: [CohortsListStore],
  templateUrl: './cohorts-list.component.html',
  styleUrl: './cohorts-list.component.scss',
})
export class CohortsListComponent {
  readonly cohortsListStore = inject(CohortsListStore);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  readonly featureStore = inject(FeatureStore);
  pageSizes = [10, 20, 50];

  // TODO: Technically there wouldn't be route params here so should this be set up differently?
  typeKey$ = this.activatedRoute.params.pipe(
    takeUntilDestroyed(),
    map(({ typeKey }) => typeKey),
  );

  dataSource = new MatTableDataSource<CohortModel>();

  // TODO: Make this an object array that has display names, so headers aren't locked to the field name.
  displayedColumns: string[] = ['name', 'description', 'tags'];

  constructor() {
    effect(() => {
      this.dataSource.data = this.cohortsListStore.cohorts();
    });
    this.typeKey$.subscribe(typeKey => {
      this.cohortsListStore.load(this.cohortsListStore.limit(), 0);
    });
  }

  rowClick(row: CohortModel) {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { detail_id: row.id },
    });
  }
}
