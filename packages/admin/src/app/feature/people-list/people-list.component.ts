import { Component, effect, inject } from '@angular/core';
import { JsonPipe, AsyncPipe } from '@angular/common';
import { PeopleListStore } from '@feature/people-list/people-list.store';
import { MatTableDataSource } from '@angular/material/table';
import { PersonModel } from '@shared/models/person.model';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ErrorContainerComponent } from '@app/feature/error-container/error-container.component';
import { MatIconButton } from '@angular/material/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { FeatureStore } from '@app/shared/store/feature.store';
import { Sort } from '@angular/material/sort';
import { PeopleTableComponent } from '@app/shared/components/people-table/people-table.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { TableHeaderComponent } from '@app/shared/components/table-header/table-header.component';
import { RefreshService } from '@app/shared/services/refresh.service';
import { NoRecordsComponent } from '@app/shared/components/no-records/no-records.component';
import { MatDialog } from '@angular/material/dialog';
import { BulkImportDialogComponent } from '@app/shared/components/dialogs/bulk-import/bulk-import-dialog.component';
import { FeatureSearchAndFilterStore } from '@app/shared/components/feature-search-and-filter/feature-search-and-filter.store';
import { buildBasicSearchForFeature } from '@app/shared/helpers/basic-search.helper';

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
    NoRecordsComponent,
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
  readonly refreshService = inject(RefreshService);
  readonly dialog = inject(MatDialog);
  readonly featureSearchAndFilterStore = inject(FeatureSearchAndFilterStore);
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
      console.log(this.peopleListStore.totalData());
    });
    // load the people list based on the route parameters if they exist
    this.typeKey$.subscribe(typeKey => {
      // Check if the search/filter store has filters set for the current feature type. If so,
      // set search. This typekey pipe fires before the navigation pipe in features-menu.component.ts
      // that flushes the filterstore if the feature changed, so the feature type must be checked against
      // here.
      let search: { field: string; searchString: string }[] = [];
      if (
        this.featureSearchAndFilterStore.currentFeature() == 'people' &&
        this.featureSearchAndFilterStore.currentSubFeature() != 'types' &&
        this.featureSearchAndFilterStore.searchText().length > 0
      ) {
        search = buildBasicSearchForFeature(
          'people',
          this.featureSearchAndFilterStore.searchText(),
        );
      }
      this.peopleListStore.load({
        limit: this.peopleListStore.limit(),
        offset: 0,
        typeKey,
        search,
      });
    });

    this.refreshService.refreshTrigger$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.peopleListStore.load({
          limit: this.peopleListStore.limit(),
          offset: this.peopleListStore.offset(),
          sort: this.peopleListStore.sort(),
          order: this.peopleListStore.order(),
          pageIndex: this.peopleListStore.pageIndex(),
          typeKey: this.peopleListStore.typeKey(),
          search: this.peopleListStore.search(),
        });
      });
  }

  rowClick(row: PersonModel) {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { detail_id: row.id },
    });
  }

  searchTextChanged(searchText: string) {
    this.peopleListStore.load({
      limit: this.peopleListStore.limit(),
      offset: 0,
      typeKey: this.peopleListStore.typeKey(),
      search: buildBasicSearchForFeature('people', searchText),
    });
  }

  viewAccount(personId: string) {
    this.router.navigate(['settings', 'users', 'list'], {
      queryParams: { detail_id: personId },
    });
  }

  sortChange(event: Sort) {
    this.peopleListStore.load({
      limit: this.peopleListStore.limit(),
      offset: this.peopleListStore.offset(),
      sort: event.active,
      order: event.direction,
      pageIndex: this.peopleListStore.pageIndex(),
      typeKey: this.peopleListStore.typeKey(),
      search: this.peopleListStore.search(),
    });
  }

  bulkImport() {
    this.dialog.open(BulkImportDialogComponent, {
      data: {
        title: 'Import People',
        types: [''],
        apiRoute: 'people',
      },
    });
  }
}
