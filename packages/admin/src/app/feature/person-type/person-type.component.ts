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
  TouchedChangeEvent,
  Validators,
  ValueChangeEvent,
} from '@angular/forms';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton, MatIconButton } from '@angular/material/button';
import { ErrorContainerComponent } from '@app/feature/error-container/error-container.component';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { PersonTypeNewType, PersonTypeType } from '@schemas/person-type.schema';
import { RouterLink } from '@angular/router';
import {
  TYPE_KEY_PATTERN,
  CREATE_PARTIAL_URL,
} from '@shared/constants/admin.constants';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { ConfirmationDialogComponent } from '@shared/components/dialogs/confirmation/confirmation-dialog.component';
import { PersonTypeStore } from '@feature/person-type/person-type.store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TagsFormComponent } from '@shared/components/tags-form/tags-form.component';
import { autoSlugify } from '@shared/helpers/auto-slug.helper';
import { BackButtonComponent } from '@shared/components/back-button/back-button.component';
import { DetailHeaderComponent } from '@shared/components/detail-header/detail-header.component';
import { DetailStore } from '@feature/detail/detail.store';
import { DimensionSchemasComponent } from '@shared/components/dimension-schemas/dimension-schemas.component';
import { DimensionSchemaType } from '@schemas/dimension-schema.schema';
import { DimensionSchemaDialogComponent } from '@shared/components/dialogs/dimension-schema/dimension-schema-dialog.component';

@Component({
  selector: 'aw-person-type',
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
    MatIcon,
    RouterLink,
    MatIconButton,
    TagsFormComponent,
    BackButtonComponent,
    DetailHeaderComponent,
    DimensionSchemasComponent,
  ],
  providers: [PersonTypeStore],
  templateUrl: './person-type.component.html',
  styleUrl: './person-type.component.scss',
})
export class PersonTypeComponent implements OnInit {
  readonly personTypeStore = inject(PersonTypeStore);
  readonly dialog = inject(MatDialog);
  destroyRef = inject(DestroyRef);
  readonly detailStore = inject(DetailStore);

  @Input() detailId!: string;

  tagsForCreate: string[] = [];

  editingRow = -1;

  personTypeForm = new FormGroup({
    name: new FormControl(
      {
        value: '',
        disabled: true,
      },
      {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(3)],
      },
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
      if (this.personTypeStore.inEditMode()) {
        this.personTypeForm.enable();
      } else {
        this.personTypeForm.disable();
      }
    });
  }

  ngOnInit(): void {
    if (this.detailId) {
      if (this.detailId === CREATE_PARTIAL_URL) {
        this.personTypeStore.initializeForCreate();
      } else {
        this.personTypeStore.initialize(this.detailId).then(() => {
          this.personTypeForm.patchValue({
            key: this.personTypeStore.personType()?.key,
            name: this.personTypeStore.personType()?.name,
            description: this.personTypeStore.personType()?.description,
            dimensionSchemasCopy:
              this.personTypeStore.dimensionSchemasCopy() ?? [],
          });
        });
      }
    }

    this.personTypeForm.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if ((event as ControlEvent) instanceof FormSubmittedEvent) {
          const personTypeFormPayload: PersonTypeNewType = {
            name: this.personTypeForm.value['name'] ?? '',
            key: this.personTypeForm.value['key'] ?? '',
            description: this.personTypeForm.value['description'] ?? '',
            dimensionSchemas:
              this.personTypeForm.value['dimensionSchemasCopy'] ?? [],
          };
          if (this.personTypeStore.inCreateMode()) {
            if (this.tagsForCreate.length > 0) {
              personTypeFormPayload['tags'] = this.tagsForCreate;
            }
            this.personTypeStore.create(personTypeFormPayload);
          } else {
            this.personTypeStore.update(personTypeFormPayload);
          }
        } else if (event instanceof ValueChangeEvent) {
          // auto-generate key from the user provided name
          if (event.source === this.personTypeForm.controls.name) {
            this.personTypeForm.patchValue({
              key: autoSlugify(this.personTypeForm.controls.name.value || ''),
            });
          }
        } else if (event instanceof TouchedChangeEvent) {
          // on name input blur trim name and regenerate key
          if (
            event.source === this.personTypeForm.controls.name &&
            this.personTypeForm.controls.name.value
          ) {
            const trimmedValue = this.personTypeForm.controls.name.value.trim();
            this.personTypeForm.patchValue({
              name: trimmedValue,
              key: autoSlugify(trimmedValue),
            });
          }
        }
      });
  }

  onCancel() {
    if (this.personTypeStore.inCreateMode()) {
      this.personTypeStore.resetDimensionSchemas();
      this.detailStore.clearDetailId();
    } else {
      // reset the form
      if (this.personTypeStore.inEditMode()) {
        this.personTypeForm.patchValue({
          key: this.personTypeStore.personType()?.key,
          name: this.personTypeStore.personType()?.name,
          description: this.personTypeStore.personType()?.description,
          dimensionSchemasCopy: this.personTypeStore.dimensionSchemasCopy(),
        });
      }
      this.personTypeStore.toggleEditMode();
    }
  }

  onDelete() {
    // TODO: show confirmation dialog
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Confirm delete',
        question: 'Are you sure you want to delete this person type?',
        okButtonText: 'Delete',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.personTypeStore.delete();
      }
    });
  }

  comparePersonTypes(pt1: PersonTypeType, pt2: PersonTypeType): boolean {
    return pt1 && pt2 ? pt1.id === pt2.id : false;
  }

  onSetTags(tags: string[]): void {
    this.personTypeStore.setTags(tags);
  }

  // This should only be used during object creation
  updateTagsForCreate(tags: string[]) {
    this.tagsForCreate = tags;
  }
  onCreateDimensionSchema(event: { schema: DimensionSchemaType }) {
    console.log('event=', event);
    this.personTypeStore.setDimensionSchemas(-1, event.schema);
    this.personTypeForm.controls.dimensionSchemasCopy.setValue(
      this.personTypeStore.dimensionSchemasCopy(),
    );
    this.personTypeForm.controls.dimensionSchemasCopy.markAsDirty();
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
        this.personTypeStore.setDimensionSchemas(this.editingRow, result);
        this.personTypeForm.controls.dimensionSchemasCopy.setValue(
          this.personTypeStore.dimensionSchemasCopy(),
        );
        this.personTypeForm.controls.dimensionSchemasCopy.markAsDirty();
      }
      this.editingRow = -1;
    });
  }

  onDeleteDimensionSchema(event: { index: number }) {
    this.personTypeStore.deleteDimensionSchema(event.index);
    this.personTypeForm.controls.dimensionSchemasCopy.setValue(
      this.personTypeStore.dimensionSchemasCopy(),
    );
    this.personTypeForm.controls.dimensionSchemasCopy.markAsDirty();
  }
}
