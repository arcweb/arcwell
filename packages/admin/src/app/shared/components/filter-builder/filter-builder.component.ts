import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  input,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ReactiveFormsModule,
  FormsModule,
  FormGroup,
  FormControl,
  ControlEvent,
  FormSubmittedEvent,
} from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatLabel, MatFormField, MatError } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { ErrorContainerComponent } from '@app/feature/error-container/error-container.component';
import { operatorsForTypes } from '@app/shared/constants/filter-config.constants';
import {
  FeatureFilter,
  FeatureFilterOperator,
} from '@app/shared/interfaces/feature-filter';
import { FilterConfigFieldModel } from '@app/shared/models/filter-config-field.model';
import { FilterConfigModel } from '@app/shared/models/filter-config.model';
import { FeatureStore } from '@app/shared/store/feature.store';
import { FilterConfigStore } from '@app/shared/store/filter-config.store';
import {
  OwlDateTimeModule,
  OwlNativeDateTimeModule,
} from '@danielmoncada/angular-datetime-picker';
import { DateTime } from 'luxon';
import { FeatureSearchAndFilterStore } from '../feature-search-and-filter/feature-search-and-filter.store';

@Component({
  selector: 'aw-filter-builder',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInput,
    MatLabel,
    MatFormField,
    MatButton,
    MatError,
    ErrorContainerComponent,
    MatOption,
    MatSelect,
    FormsModule,
    MatIcon,
    MatIconButton,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
  ],
  templateUrl: './filter-builder.component.html',
  styleUrl: './filter-builder.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterBuilderComponent implements OnInit {
  readonly destroyRef = inject(DestroyRef);
  readonly featureStore = inject(FeatureStore);
  readonly featureSearchAndFilterStore = inject(FeatureSearchAndFilterStore);
  readonly filterConfigStore = inject(FilterConfigStore);
  filterConfig: FilterConfigModel | undefined;
  filterOperators: FeatureFilterOperator[] = [];

  filterToEditIndex = input<number>();

  onFilterCanceled = output();
  onFilterSaved = output<FeatureFilter>();

  filterBuilderForm = new FormGroup({
    field: new FormControl<FilterConfigFieldModel | null>({
      value: null,
      disabled: false,
    }),
    operator: new FormControl<FeatureFilterOperator | null>({
      value: null,
      disabled: false,
    }),
    filterValue: new FormControl<string | number | boolean | DateTime | null>({
      value: null,
      disabled: false,
    }),
  });

  ngOnInit(): void {
    this.filterConfig = this.filterConfigStore.getConfigForFeature(
      this.featureStore.activeFeature()!.path,
    );

    console.log(this.filterToEditIndex());

    if (this.filterToEditIndex() !== undefined) {
      const filter =
        this.featureSearchAndFilterStore.filters()[this.filterToEditIndex()!];
      this.filterBuilderForm.patchValue({
        field: filter.field,
        operator: filter.operator,
        filterValue: filter.value,
      });
      this.filterOperators = operatorsForTypes[filter.field.type];
    }

    this.filterBuilderForm.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if ((event as ControlEvent) instanceof FormSubmittedEvent) {
          const newFilter: FeatureFilter = {
            field: this.filterBuilderForm.value['field']!,
            operator: this.filterBuilderForm.value['operator']!,
            value: this.filterBuilderForm.value['filterValue']!,
          };
          this.onFilterSaved.emit(newFilter);
        }
      });
  }

  compareFields(
    f1: FilterConfigFieldModel,
    f2: FilterConfigFieldModel,
  ): boolean {
    return f1 && f2 ? f1.name === f2.name : false;
  }

  compareOperators(
    o1: FeatureFilterOperator,
    o2: FeatureFilterOperator,
  ): boolean {
    return o1 && o2 ? o1.name === o2.name : false;
  }

  fieldChanged(event: MatSelectChange) {
    this.filterOperators = operatorsForTypes[event.value.type];
    this.filterBuilderForm.patchValue({
      filterValue: null,
    });
  }

  onCancel() {
    this.onFilterCanceled.emit();
  }
}
