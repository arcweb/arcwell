import { Component, effect, inject } from '@angular/core';
import { JsonPipe, AsyncPipe } from '@angular/common';
import { PeopleListStore } from '@feature/project-management/people-list/people-list.store';
import { MatTableDataSource } from '@angular/material/table';
import { PersonModel } from '@shared/models/person.model';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ErrorContainerComponent } from '@feature/project-management/error-container/error-container.component';
import { MatIconButton } from '@angular/material/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { FeatureStore } from '@app/shared/store/feature.store';
import { Sort } from '@angular/material/sort';
import { PeopleTableComponent } from '@app/shared/components/people-table/people-table.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { TableHeaderComponent } from '@app/shared/components/table-header/table-header.component';

@Component({
  selector: 'aw-people-list',
  standalone: true,
  imports: [
    AsyncPipe,
    JsonPipe,
    ErrorContainerComponent,
    FontAwesomeModule,
    RouterLink,
    MatIconButton,
    PeopleTableComponent,
    TableHeaderComponent,
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
    map(({ type_key: typeKey }) => typeKey),
  );
  faCirclePlus = faCirclePlus;

  dataSource = new MatTableDataSource<PersonModel>();

  // TODO: Make this an object array that has display names, so headers aren't locked to the field name.
  displayedColumns: string[] = [
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
      this.peopleListStore.load({
        limit: this.peopleListStore.limit(),
        offset: 0,
        typeKey: typeKey,
      });
    });
  }

  rowClick(row: PersonModel) {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { detail_id: row.id },
    });
  }

  viewAccount(personId: string) {
    this.router.navigate(
      ['project-management', 'settings', 'user-management', 'list'],
      {
        queryParams: { detail_id: personId },
      },
    );
  }

  sortChange(event: Sort) {
    this.peopleListStore.load({
      limit: this.peopleListStore.limit(),
      offset: this.peopleListStore.offset(),
      sort: event.active,
      order: event.direction,
      pageIndex: this.peopleListStore.pageIndex(),
      typeKey: this.peopleListStore.typeKey(),
    });
  }
}
