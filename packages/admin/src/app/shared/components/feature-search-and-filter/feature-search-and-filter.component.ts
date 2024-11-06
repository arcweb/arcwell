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

  onSearchTextChanged = output<string>();

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
          this.onSearchTextChanged.emit(searchText);
        }
      });
  }

  ngAfterViewInit() {
    this.searchInput.nativeElement.focus();
  }

  onClear() {
    this.searchTextCtrl.setValue('');
  }
}
