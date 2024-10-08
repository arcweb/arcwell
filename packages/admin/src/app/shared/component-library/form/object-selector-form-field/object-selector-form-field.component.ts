import {
  Component,
  OnInit,
  forwardRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormControl,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { PersonService } from '@shared/services/person.service';
import { ResourceService } from '@shared/services/resource.service';
import { PersonType } from '@schemas/person.schema';
import { EventType } from '@schemas/event.schema';
import { ResourceType } from '@schemas/resource.schema';
import { EventService } from '@shared/services/event.service';
import { CohortService } from '@app/shared/services/cohort.service';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { PersonTypeType } from '@app/shared/schemas/person-type.schema';
import { EventTypeType } from '@app/shared/schemas/event-type.schema';
import { ResourceTypeType } from '@app/shared/schemas/resource-type.schema';

@Component({
  standalone: true,
  selector: 'aw-object-selector-form-field',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatOption,
    MatSelect,
  ],
  templateUrl: './object-selector-form-field.component.html',
  styleUrl: './object-selector-form-field.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ObjectSelectorFormFieldComponent),
      multi: true,
    },
  ],
})
export class ObjectSelectorFormFieldComponent
  implements ControlValueAccessor, OnInit
{
  // Services
  personService = inject(PersonService);
  resourceService = inject(ResourceService);
  eventService = inject(EventService);
  cohortService = inject(CohortService);

  // Inputs
  placeholder = input<string>('Type to search...');
  label = input<string>('Object');
  objectType = input.required<
    'people' | 'cohortPeople' | 'personCohorts' | 'resources' | 'events'
  >();
  // To use for filtering search on subtype
  objectSubTypes = input<
    EventTypeType[] | PersonTypeType[] | ResourceTypeType[]
  >([]);
  displayProperty = input.required<string>();
  // This is to pass in an id of a related object so to screen out objects of the objectType
  // related to it. Want to keep it generic to allow use across the app, but could use a better
  // name if possible.
  objectIdForFiltering = input<string>();

  valueSignal = signal<string>('');
  optionsSignal = signal<PersonType[] | EventType[] | ResourceType[]>([]);

  objectSubTypeListSignal = signal<{ name: string; key: string | undefined }[]>(
    [{ name: 'All', key: undefined }],
  );
  typeKeySignal = signal<{ name: string; key: string | undefined }>({
    name: 'All',
    key: undefined,
  });

  // Internal FormControl for handling validation and disabled state
  internalControl = new FormControl('');

  private onChange: (value: string | object | null) => void = () => {
    // This is intentionally left empty to avoid typescript complaining
  };
  private onTouched: () => void = () => {
    // This is intentionally left empty to avoid typescript complaining
  };

  private _value: PersonType | EventType | ResourceType | null;

  private clearSelection(): void {
    this.valueSignal.set('');
    this.internalControl.setValue('');
    this._value = null;
    this.onChange(null); // Pass null to the parent form when input is cleared
  }

  ngOnInit(): void {
    if (this.objectSubTypes().length > 0) {
      this.objectSubTypeListSignal.set(
        this.objectSubTypeListSignal().concat(
          this.objectSubTypes().map(type => ({
            name: type.name,
            key: type.key,
          })),
        ),
      );
    }
  }

  onInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;

    // If the input is cleared, reset to null
    if (!value) {
      this.clearSelection();
    } else {
      this.valueSignal.set(value);
      this.internalControl.setValue(value);
      this.onChange(this._value);
      this.fetchOptions(value); // Fetch options based on the typed value
    }
  }

  onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    const selectedOption = event.option.value;
    this._value = selectedOption;
    const displayValue = selectedOption[this.displayProperty()];
    this.valueSignal.set(displayValue);
    this.internalControl.setValue(displayValue);
    this.onChange(this._value);
  }

  fetchOptions(query: string): void {
    if (!query) {
      this.optionsSignal.set([]);
      return;
    }

    switch (this.objectType()) {
      case 'people':
        this.personService
          .getPeople({
            limit: 20,
            offset: 0,
            search: [{ field: 'familyName', searchString: query }],
            typeKey: this.typeKeySignal()['key'],
          })
          .subscribe(resp => {
            if (resp.errors) {
              console.error(resp.errors);
            } else {
              this.optionsSignal.set(resp.data);
            }
          });
        break;
      case 'cohortPeople':
        if (!this.objectIdForFiltering()) {
          console.error(
            'objectIdForFiltering must be defined for objectType=cohortPeople',
          );
          return;
        }
        this.personService
          .getPeople({
            limit: 20,
            offset: 0,
            notInCohort: this.objectIdForFiltering(),
            search: [{ field: 'familyName', searchString: query }],
            typeKey: this.typeKeySignal()['key'],
          })
          .subscribe(resp => {
            if (resp.errors) {
              console.error(resp.errors);
            } else {
              this.optionsSignal.set(resp.data);
            }
          });
        break;
      case 'personCohorts':
        if (!this.objectIdForFiltering()) {
          console.error(
            'objectIdForFiltering must be defined for objectType=personCohorts',
          );
          return;
        }
        this.cohortService
          .getCohorts({
            limit: 20,
            offset: 0,
            notRelatedToPerson: this.objectIdForFiltering(),
            search: [{ field: 'name', searchString: query }],
          })
          .subscribe(resp => {
            if (resp.errors) {
              console.error(resp.errors);
            } else {
              this.optionsSignal.set(resp.data);
            }
          });
        break;
      case 'resources':
        this.resourceService
          .getResources({
            limit: 20,
            offset: 0,
            search: [{ field: 'name', searchString: query }],
            typeKey: this.typeKeySignal()['key'],
          })
          .subscribe(resp => {
            if (resp.errors) {
              console.error(resp.errors);
            } else {
              this.optionsSignal.set(resp.data);
            }
          });
        break;
      case 'events':
        this.eventService
          .getEvents({
            limit: 20,
            offset: 0,
            search: [{ field: 'id', searchString: query }],
            typeKey: this.typeKeySignal()['key'],
          })
          .subscribe(resp => {
            if (resp.errors) {
              console.error(resp.errors);
            } else {
              this.optionsSignal.set(resp.data);
            }
          });
        break;
      default:
        throw new Error('Unimplemented service type');
    }
  }

  // ControlValueAccessor methods

  writeValue(value: PersonType | EventType | ResourceType): void {
    this._value = value;
    if (value && value[this.displayProperty()]) {
      const displayValue = value[this.displayProperty()];
      this.valueSignal.set(displayValue);
      this.internalControl.setValue(displayValue, { emitEvent: false });
    } else {
      // If the value is null, clear the control and signal
      this.valueSignal.set('');
      this.internalControl.setValue('', { emitEvent: false });
    }
  }

  public registerOnChange(fn: (value: string | object | null) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  // Implement the setDisabledState method
  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.internalControl.disable({ emitEvent: false });
    } else {
      this.internalControl.enable({ emitEvent: false });
    }
  }

  compareObjectSubTypes(
    pt1: { name: string; key: string | undefined },
    pt2: { name: string; key: string | undefined },
  ): boolean {
    return pt1 && pt2 ? pt1.key === pt2.key : false;
  }

  objectSubTypeChanged() {
    // Reset selections to null
    this.optionsSignal.set([]);
    this.clearSelection();
  }
}
