import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  ViewChild,
  effect,
  inject,
  output,
} from '@angular/core';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FeatureSearchAndFilterStore } from './feature-search-and-filter.store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FilterBuilderComponent } from '../filter-builder/filter-builder.component';
import { MatCardModule } from '@angular/material/card';
import { FeatureFilter } from '@app/shared/interfaces/feature-filter';
import { cloneDeep } from 'lodash-es';

@Component({
  selector: 'aw-feature-search-and-filter',
  standalone: true,
  imports: [
    MatDialogContent,
    MatButton,
    MatDialogActions,
    MatDialogTitle,
    MatDialogClose,
    MatFormFieldModule,
    MatIconModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormField,
    MatInput,
    FilterBuilderComponent,
    MatCardModule,
  ],
  templateUrl: './feature-search-and-filter.component.html',
  styleUrl: './feature-search-and-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureSearchAndFilterComponent implements OnInit, AfterViewInit {
  readonly searchTextCtrl = new FormControl();
  readonly featureSearchAndFilterStore = inject(FeatureSearchAndFilterStore);
  destroyRef = inject(DestroyRef);
  @ViewChild('searchInput') searchInput!: ElementRef;

  onSearchTextChanged = output();
  onFiltersChanged = output();

  filterFormActive = false;
  filterToEditIndex: number | undefined = undefined;

  constructor() {
    effect(() => {
      if (this.featureSearchAndFilterStore.searchText().length > 0) {
        this.searchTextCtrl.setValue(
          this.featureSearchAndFilterStore.searchText(),
        );
      }
    });
  }

  ngOnInit(): void {
    this.searchTextCtrl.valueChanges
      // Delay after user finishes typing to allow for further typing
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((searchText: string) => {
        if (searchText != this.featureSearchAndFilterStore.searchText()) {
          this.featureSearchAndFilterStore.setSearchText(searchText);
          this.onSearchTextChanged.emit();
        }
      });
  }

  ngAfterViewInit() {
    if (
      (this.featureSearchAndFilterStore.currentFeature() !== 'events' &&
        this.featureSearchAndFilterStore.currentFeature() !== 'facts') ||
      this.featureSearchAndFilterStore.currentSubFeature() === 'types'
    )
      this.searchInput.nativeElement.focus();
  }

  onClear() {
    this.featureSearchAndFilterStore.resetSearchAndFilters();
    this.searchTextCtrl.setValue('');
    this.onSearchTextChanged.emit();
  }

  deleteFilter(filterIndex: number) {
    const filters = cloneDeep(this.featureSearchAndFilterStore.filters());
    filters.splice(filterIndex, 1);
    this.featureSearchAndFilterStore.setFilters(filters);
    this.onFiltersChanged.emit();
  }

  editFilter(filterIndex: number) {
    this.filterToEditIndex = filterIndex;
    this.filterFormActive = true;
  }

  filterCanceled() {
    this.filterFormActive = false;
    this.filterToEditIndex = undefined;
  }

  filterSaved(filter: FeatureFilter) {
    const filters = cloneDeep(this.featureSearchAndFilterStore.filters());
    if (this.filterToEditIndex !== undefined) {
      // Editing
      filters[this.filterToEditIndex] = filter;
    } else {
      filters.push(filter);
    }
    this.featureSearchAndFilterStore.setFilters(filters);
    this.filterToEditIndex = undefined;
    this.filterFormActive = false;
    this.onFiltersChanged.emit();
  }

  truncateValue(value: string, length: number) {
    if (value.length >= length) {
      return value.substring(0, length) + '...';
    } else {
      return value;
    }
  }
}
