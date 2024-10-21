import {
  Component,
  DestroyRef,
  effect,
  inject,
  Input,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormGroup,
  FormControl,
  Validators,
  ControlEvent,
  FormSubmittedEvent,
  ValueChangeEvent,
  ReactiveFormsModule,
  TouchedChangeEvent,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { ConfirmationDialogComponent } from '@app/shared/components/dialogs/confirmation/confirmation-dialog.component';
import {
  CREATE_PARTIAL_URL,
  TYPE_KEY_PATTERN,
} from '@app/shared/constants/admin.constants';
import { EventTypeType } from '@app/shared/schemas/event-type.schema';
import { EventTypeStore } from './event-type.store';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatLabel, MatFormField, MatError } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { ErrorContainerComponent } from '../error-container/error-container.component';
import { TagsFormComponent } from '@shared/components/tags-form/tags-form.component';
import { autoSlugify } from '@app/shared/helpers/auto-slug.helper';
import { BackButtonComponent } from '@app/shared/components/back-button/back-button.component';
import { DetailHeaderComponent } from '@app/shared/components/detail-header/detail-header.component';
import { DetailStore } from '@feature/detail/detail.store';
import { DimensionSchemasComponent } from '@shared/components/dimension-schemas/dimension-schemas.component';
import { DimensionSchemaType } from '@schemas/dimension-schema.schema';
import { PersonTypeNewType } from '@schemas/person-type.schema';
import { DimensionSchemaDialogComponent } from '@shared/components/dialogs/dimension-schema/dimension-schema-dialog.component';

@Component({
  selector: 'aw-event-type',
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
    DetailHeaderComponent,
    DimensionSchemasComponent,
  ],
  providers: [EventTypeStore],
  templateUrl: './event-type.component.html',
  styleUrl: './event-type.component.scss',
})
export class EventTypeComponent implements OnInit {
  readonly eventTypeStore = inject(EventTypeStore);
  readonly dialog = inject(MatDialog);
  destroyRef = inject(DestroyRef);
  readonly detailStore = inject(DetailStore);

  @Input() detailId!: string;

  tagsForCreate: string[] = [];
  editingRow = -1;

  eventTypeForm = new FormGroup({
    name: new FormControl(
      {
        value: '',
        disabled: true,
      },
      [Validators.required, Validators.minLength(3)],
    ),
    key: new FormControl(
      {
        value: '',
        disabled: true,
      },
      [Validators.pattern(TYPE_KEY_PATTERN), Validators.minLength(3)],
    ),
    description: new FormControl({
      value: '',
      disabled: true,
    }),
    dimensionSchemasCopy: new FormControl<DimensionSchemaType[]>({
      value: [],
      disabled: true,
    }),
  });

  constructor() {
    effect(() => {
      if (this.eventTypeStore.inEditMode()) {
        this.eventTypeForm.enable();
      } else {
        this.eventTypeForm.disable();
      }
    });
  }

  ngOnInit(): void {
    if (this.detailId) {
      if (this.detailId === CREATE_PARTIAL_URL) {
        this.eventTypeStore.initializeForCreate();
      } else {
        this.eventTypeStore.initialize(this.detailId).then(() => {
          this.eventTypeForm.patchValue({
            key: this.eventTypeStore.eventType()?.key,
            name: this.eventTypeStore.eventType()?.name,
            description: this.eventTypeStore.eventType()?.description,
            dimensionSchemasCopy:
              this.eventTypeStore.dimensionSchemasCopy() ?? [],
          });
        });
      }
    }

    this.eventTypeForm.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if ((event as ControlEvent) instanceof FormSubmittedEvent) {
          const eventTypeFormPayload: PersonTypeNewType = {
            name: this.eventTypeForm.value['name'] ?? '',
            key: this.eventTypeForm.value['key'] ?? '',
            description: this.eventTypeForm.value['description'] ?? '',
            dimensionSchemas:
              this.eventTypeForm.value['dimensionSchemasCopy'] ?? [],
          };
          if (this.eventTypeStore.inCreateMode()) {
            if (this.tagsForCreate.length > 0) {
              eventTypeFormPayload['tags'] = this.tagsForCreate;
            }
            this.eventTypeStore.create(eventTypeFormPayload);
          } else {
            this.eventTypeStore.update(eventTypeFormPayload);
          }
        } else if (event instanceof ValueChangeEvent) {
          // auto-generate key from the user provided name
          if (event.source === this.eventTypeForm.controls.name) {
            this.eventTypeForm.patchValue({
              key: autoSlugify(this.eventTypeForm.controls.name.value || ''),
            });
          }
        } else if (event instanceof TouchedChangeEvent) {
          if (
            event.source === this.eventTypeForm.controls.name &&
            this.eventTypeForm.controls.name.value
          ) {
            // on name input blur trim name and regenerate key
            const trimmedValue = this.eventTypeForm.controls.name.value.trim();
            this.eventTypeForm.patchValue({
              name: trimmedValue,
              key: autoSlugify(trimmedValue),
            });
          }
        }
      });
  }

  onCancel() {
    // reset the form
    if (this.eventTypeStore.inEditMode()) {
      this.eventTypeStore.resetDimensionSchemas();
      this.eventTypeForm.patchValue({
        key: this.eventTypeStore.eventType()?.key,
        name: this.eventTypeStore.eventType()?.name,
        description: this.eventTypeStore.eventType()?.description,
        dimensionSchemasCopy: this.eventTypeStore.dimensionSchemasCopy(),
      });
    }
    this.eventTypeStore.toggleEditMode();
  }

  onDelete() {
    // TODO: show confirmation dialog
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Confirm delete',
        question: 'Are you sure you want to delete this event type?',
        okButtonText: 'Delete',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.eventTypeStore.delete();
      }
    });
  }

  compareEventTypes(pt1: EventTypeType, pt2: EventTypeType): boolean {
    return pt1 && pt2 ? pt1.id === pt2.id : false;
  }

  onSetTags(tags: string[]): void {
    this.eventTypeStore.setTags(tags);
  }

  // This should only be used during object creation
  updateTagsForCreate(tags: string[]) {
    this.tagsForCreate = tags;
  }
  onCreateDimensionSchema(event: { schema: DimensionSchemaType }) {
    console.log('event=', event);
    this.eventTypeStore.setDimensionSchemas(-1, event.schema);
    this.eventTypeForm.controls.dimensionSchemasCopy.setValue(
      this.eventTypeStore.dimensionSchemasCopy(),
    );
    this.eventTypeForm.controls.dimensionSchemasCopy.markAsDirty();
  }

  onEditDimensionSchema(event: {
    index: number;
    element: DimensionSchemaType;
  }) {
    this.editingRow = event.index;
    console.log('Edit row ', event.index, ', ', event.element);

    const dialogRef = this.dialog.open(DimensionSchemaDialogComponent, {
      minHeight: '520px',
      width: '800px',
      data: {
        title: 'Edit Dimension Schema',
        dimensionSchema: event.element,
        okButtonText: 'Save',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.eventTypeStore.setDimensionSchemas(this.editingRow, result);
        this.eventTypeForm.controls.dimensionSchemasCopy.setValue(
          this.eventTypeStore.dimensionSchemasCopy(),
        );
        this.eventTypeForm.controls.dimensionSchemasCopy.markAsDirty();
      }
      this.editingRow = -1;
    });
  }

  onDeleteDimensionSchema(event: { index: number }) {
    this.eventTypeStore.deleteDimensionSchema(event.index);
    this.eventTypeForm.controls.dimensionSchemasCopy.setValue(
      this.eventTypeStore.dimensionSchemasCopy(),
    );
    this.eventTypeForm.controls.dimensionSchemasCopy.markAsDirty();
  }
}
