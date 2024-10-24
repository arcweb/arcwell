import {
  Component,
  DestroyRef,
  effect,
  inject,
  Input,
  OnInit,
} from '@angular/core';
import {
  ControlEvent,
  FormControl,
  FormGroup,
  FormSubmittedEvent,
  ReactiveFormsModule,
  Validators,
  ValueChangeEvent,
} from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatLabel, MatFormField, MatError } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { ErrorContainerComponent } from '../error-container/error-container.component';
import { EventStore } from './event.store';
import { MatDialog } from '@angular/material/dialog';
import { CREATE_PARTIAL_URL } from '@app/shared/constants/admin.constants';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmationDialogComponent } from '@app/shared/components/dialogs/confirmation/confirmation-dialog.component';
import { EventTypeType } from '@app/shared/schemas/event-type.schema';
import { TagsFormComponent } from '@shared/components/tags-form/tags-form.component';
import {
  OwlDateTimeModule,
  OwlNativeDateTimeModule,
} from '@danielmoncada/angular-datetime-picker';
import { ObjectSelectorFormFieldComponent } from '@shared/component-library/form/object-selector-form-field/object-selector-form-field.component';
import { PersonType } from '@schemas/person.schema';
import { ResourceType } from '@schemas/resource.schema';
import { BackButtonComponent } from '@app/shared/components/back-button/back-button.component';
import { DetailHeaderComponent } from '@app/shared/components/detail-header/detail-header.component';
import { DetailStore } from '@feature/detail/detail.store';
import { EventType } from '@app/shared/schemas/event.schema';
import { DimensionComponent } from '@shared/components/dimension/dimension.component';
import { DimensionType } from '@schemas/dimension.schema';
import { DimensionDialogComponent } from '@shared/components/dialogs/dimension/dimension-dialog.component';

@Component({
  selector: 'aw-event',
  standalone: true,
  imports: [
    BackButtonComponent,
    ReactiveFormsModule,
    MatInput,
    MatLabel,
    MatFormField,
    MatButton,
    MatError,
    ErrorContainerComponent,
    MatOption,
    MatSelect,
    MatIcon,
    RouterLink,
    MatIconButton,
    TagsFormComponent,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    ObjectSelectorFormFieldComponent,
    DetailHeaderComponent,
    DimensionComponent,
  ],
  providers: [EventStore],
  templateUrl: './event.component.html',
  styleUrl: './event.component.scss',
})
export class EventComponent implements OnInit {
  readonly eventStore = inject(EventStore);
  readonly dialog = inject(MatDialog);
  destroyRef = inject(DestroyRef);
  readonly detailStore = inject(DetailStore);

  @Input() detailId!: string;
  @Input() typeKey: string | undefined = undefined;

  tagsForCreate: string[] = [];

  editingRow = -1;

  eventForm = new FormGroup({
    eventType: new FormControl<EventTypeType | null>(
      { value: '', disabled: true },
      Validators.required,
    ),
    startedAt: new FormControl(
      { value: '', disabled: true },
      Validators.required,
    ),
    endedAt: new FormControl({ value: '', disabled: true }),
    person: new FormControl<PersonType | null>({ value: null, disabled: true }),
    resource: new FormControl<ResourceType | null>({
      value: null,
      disabled: true,
    }),
    dimensionsCopy: new FormControl<DimensionType[]>({
      value: [],
      disabled: true,
    }),
  });

  constructor() {
    effect(() => {
      if (this.eventStore.inEditMode()) {
        this.eventForm.enable();
      } else {
        this.eventForm.disable();
      }
    });
    effect(() => {
      // update the form with the event type if typeKey is provided in the query params
      if (this.eventStore.eventTypes() && this.typeKey) {
        this.eventForm.patchValue({
          eventType: this.eventStore
            .eventTypes()
            .find(et => et.key === this.typeKey),
        });
      }
    });
  }

  ngOnInit(): void {
    if (this.detailId) {
      if (this.detailId === CREATE_PARTIAL_URL) {
        this.eventStore.initializeForCreate();
      } else {
        this.eventStore.initialize(this.detailId).then(() => {
          this.eventForm.patchValue({
            eventType: this.eventStore.event()?.eventType,
            startedAt: this.eventStore.event()?.startedAt
              ? this.eventStore.event()?.startedAt.toJSDate()
              : null,
            endedAt: this.eventStore.event()?.endedAt
              ? this.eventStore.event()?.endedAt.toJSDate()
              : null,
            person: this.eventStore.event()?.person,
            resource: this.eventStore.event()?.resource,
            dimensionsCopy: this.eventStore.dimensionsCopy() ?? [],
          });
        });
      }
    }

    this.eventForm.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if ((event as ControlEvent) instanceof FormSubmittedEvent) {
          const formValue = this.eventForm.value;

          const eventFormPayload: EventType = {
            eventType: formValue.eventType,
            dimensions: formValue.dimensionsCopy ?? [],
            personId: this.isObjectModel(formValue.person)
              ? formValue.person.id
              : null,
            resourceId: this.isObjectModel(formValue.resource)
              ? formValue.resource.id
              : null,
          };

          if (this.eventStore.inCreateMode()) {
            if (this.tagsForCreate.length > 0) {
              eventFormPayload['tags'] = this.tagsForCreate;
            }
            this.eventStore.create(eventFormPayload);
          } else {
            this.eventStore.update(eventFormPayload);
          }
        } else if (event instanceof ValueChangeEvent) {
          // This is here for an example.  Also, there are other events that can be caught
        }
      });
  }

  isObjectModel(obj: unknown) {
    return (
      obj &&
      typeof obj === 'object' &&
      'id' in obj &&
      typeof obj.id === 'string'
    );
  }

  onCancel() {
    if (this.eventStore.inCreateMode()) {
      this.detailStore.clearDetailId();
    } else {
      // reset the form
      if (this.eventStore.inEditMode()) {
        this.eventStore.resetDimensions();
        this.eventForm.patchValue({
          eventType: this.eventStore.event()?.eventType,
          startedAt: this.eventStore.event()?.startedAt
            ? this.eventStore.event()?.startedAt.toJSDate()
            : null,
          endedAt: this.eventStore.event()?.endedAt
            ? this.eventStore.event()?.endedAt.toJSDate()
            : null,
          person: this.eventStore.event()?.person,
          resource: this.eventStore.event()?.resource,
          dimensionsCopy: this.eventStore.dimensionsCopy(),
        });
        this.eventForm.markAsPristine();
      }
      this.eventStore.toggleEditMode();
    }
  }

  onDelete() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Confirm delete',
        question: 'Are you sure you want to delete this event?',
        okButtonText: 'Delete',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.eventStore.delete();
      }
    });
  }

  compareEventTypes(pt1: EventTypeType, pt2: EventTypeType): boolean {
    return pt1 && pt2 ? pt1.id === pt2.id : false;
  }

  onSetTags(tags: string[]): void {
    this.eventStore.setTags(tags);
  }

  // This should only be used during object creation
  updateTagsForCreate(tags: string[]) {
    this.tagsForCreate = tags;
  }

  onCreateDimension(event: { schema: DimensionType }) {
    this.eventStore.setDimensions(-1, event.schema);
    this.eventForm.controls.dimensionsCopy.setValue(
      this.eventStore.dimensionsCopy(),
    );
    this.eventForm.controls.dimensionsCopy.markAsDirty();
  }

  onEditDimension(event: { index: number; element: DimensionType }) {
    this.editingRow = event.index;
    console.log('Edit row ', event.index, ', ', event.element);

    const dialogRef = this.dialog.open(DimensionDialogComponent, {
      minHeight: '320px',
      width: '800px',
      data: {
        title: 'Edit Dimension',
        dimension: event.element,
        okButtonText: 'Save',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.eventStore.setDimensions(this.editingRow, result);
        this.eventForm.controls.dimensionsCopy.setValue(
          this.eventStore.dimensionsCopy(),
        );
        this.eventForm.controls.dimensionsCopy.markAsDirty();
      }
      this.editingRow = -1;
    });
  }

  onDeleteDimension(event: { index: number }) {
    this.eventStore.deleteDimensionSchema(event.index);
    this.eventForm.controls.dimensionsCopy.setValue(
      this.eventStore.dimensionsCopy(),
    );
    this.eventForm.controls.dimensionsCopy.markAsDirty();
  }
}
