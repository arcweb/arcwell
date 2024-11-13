import { Component, output, input, inject } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
} from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCirclePlus,
  faBars,
  faMagnifyingGlass,
  faFileArrowDown,
} from '@fortawesome/free-solid-svg-icons';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CREATE_PARTIAL_URL } from '@app/shared/constants/admin.constants';
import { FeatureSearchAndFilterComponent } from '../feature-search-and-filter/feature-search-and-filter.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { FeatureSearchAndFilterStore } from '../feature-search-and-filter/feature-search-and-filter.store';
import { NgClass } from '@angular/common';

interface QueryParams {
  type_key?: string;
}

@Component({
  selector: 'aw-table-header',
  standalone: true,
  imports: [
    FontAwesomeModule,
    MatBadgeModule,
    MatButtonModule,
    RouterLink,
    MatIconButton,
    MatTooltipModule,
    OverlayModule,
    FeatureSearchAndFilterComponent,
    NgClass,
  ],
  templateUrl: './table-header.component.html',
  styleUrl: './table-header.component.scss',
})
export class TableHeaderComponent {
  filterOpen = false;
  filterOffsetY = 20;
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  readonly featureSearchAndFilterStore = inject(FeatureSearchAndFilterStore);

  tableName = input.required<string>();
  createLinkQueryParams = input<QueryParams>();
  enableFilter = input<boolean>(true);

  onSearchTextChanged = output<string>();
  onFilterClosed = output();
  onExportCSV = output();

  faCirclePlus = faCirclePlus;
  faBars = faBars;
  faFileArrowDown = faFileArrowDown;
  faMagnifyingGlass = faMagnifyingGlass;

  readonly navigation = this.router.events.pipe(
    takeUntilDestroyed(),
    filter(event => event instanceof NavigationEnd),
  );

  constructor() {
    this.navigation.pipe(takeUntilDestroyed()).subscribe(event => {
      // Always close filter overlay on navigation change
      this.filterOpen = false;
    });
  }

  onCreate() {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        ...this.createLinkQueryParams(),
        detail_id: CREATE_PARTIAL_URL,
      },
    });
  }

  activeFilterCount(): number {
    // Run through all filters in search/filter store and determine if they're active
    let result = 0;
    if (this.featureSearchAndFilterStore.searchText().length > 0) {
      result++;
    }
    return result;
  }

  searchTextChanged(searchText: string) {
    this.onSearchTextChanged.emit(searchText);
  }

  exportCSV() {
    this.onExportCSV.emit();
  }
}
