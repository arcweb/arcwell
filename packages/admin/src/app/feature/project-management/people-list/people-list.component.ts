import { Component, effect, inject } from '@angular/core';
import { JsonPipe, AsyncPipe } from '@angular/common';
import { PeopleListStore } from '@feature/project-management/people-list/people-list.store';
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
import { PersonModel } from '@shared/models/person.model';
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
  selector: 'aw-people-list',
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
  providers: [PeopleListStore],
  templateUrl: './people-list.component.html',
  styleUrl: './people-list.component.scss',
})
export class PeopleListComponent {
  readonly peopleListStore = inject(PeopleListStore);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  readonly featureStore = inject(FeatureStore);
  pageSizes = [10, 20, 50];
  typeKey$ = this.activatedRoute.params.pipe(
    takeUntilDestroyed(),
    map(({ typeKey }) => typeKey),
  );

  dataSource = new MatTableDataSource<PersonModel>();

  // TODO: Make this an object array that has display names, so headers aren't locked to the field name.
  displayedColumns: string[] = [
    'id',
    'familyName',
    'givenName',
    'personType',
    'tags',
    'user',
  ];

  constructor() {
    effect(() => {
      this.dataSource.data = this.peopleListStore.people();
    });
    // load the people list based on the route parameters if they exist
    this.typeKey$.subscribe(typeKey => {
      this.peopleListStore.load(
        this.peopleListStore.limit(),
        0,
        '',
        '',
        typeKey,
      );
    });
  }

  handleClick(row: PersonModel) {
    this.router.navigate(['project-management', 'people', row.id]);
  }

  viewAccount(personId: string) {
    this.router.navigate(['user-management', 'all-users', personId]);
  }

  sortChange(event: Sort) {
    this.peopleListStore.load(
      this.peopleListStore.limit(),
      this.peopleListStore.offset(),
      event.active,
      event.direction,
      this.peopleListStore.pageIndex(),
      this.peopleListStore.typeKey(),
    );
  }
}
