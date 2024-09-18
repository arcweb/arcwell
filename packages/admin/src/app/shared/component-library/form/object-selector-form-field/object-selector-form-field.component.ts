import { Component, forwardRef, inject, input, signal } from '@angular/core';
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
export class ObjectSelectorFormFieldComponent implements ControlValueAccessor {
  // Services
  personService = inject(PersonService);
  resourceService = inject(ResourceService);
  eventService = inject(EventService);

  // Inputs
  placeholder = input<string>('Type to search...');
  label = input<string>('Object');
  serviceType = input.required<'people' | 'resources' | 'events'>();
  displayProperty = input.required<string>();

  valueSignal = signal<string>('');
  optionsSignal = signal<PersonType[] | EventType[] | ResourceType[]>([]);

  // Internal FormControl for handling validation and disabled state
  internalControl = new FormControl('');

  private onChange: (value: string | object | null) => void = () => {
    // This is intentionally left empty to avoid typescript complaining
  };
  private onTouched: () => void = () => {
    // This is intentionally left empty to avoid typescript complaining
  };

  private _value: PersonType | EventType | ResourceType | null;

  onInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;

    // If the input is cleared, reset to null
    if (!value) {
      this.valueSignal.set('');
      this.internalControl.setValue('');
      this._value = null;
      this.onChange(null); // Pass null to the parent form when input is cleared
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

    switch (this.serviceType()) {
      case 'people':
        this.personService
          .getPeople({
            limit: 20,
            offset: 0,
            search: [{ field: 'familyName', searchString: query }],
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
}
