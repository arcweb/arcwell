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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { ErrorContainerComponent } from '@app/feature/error-container/error-container.component';
import {
  CREATE_PARTIAL_URL,
  TYPE_KEY_PATTERN,
} from '@shared/constants/admin.constants';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@shared/components/dialogs/confirmation/confirmation-dialog.component';
import { FactTypeStore } from '@feature/fact-type/fact-type.store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TagsFormComponent } from '@shared/components/tags-form/tags-form.component';
import { autoSlugify } from '@app/shared/helpers/auto-slug.helper';
import { DetailHeaderComponent } from '@shared/components/detail-header/detail-header.component';
import { FactTypeNewType } from '@schemas/fact-type.schema';
import { DimensionSchemaDialogComponent } from '@shared/components/dialogs/dimension-schema/dimension-schema-dialog.component';
import { DetailStore } from '@feature/detail/detail.store';
import { DimensionSchemaType } from '@schemas/dimension-schema.schema';
import { DimensionSchemasComponent } from '@shared/components/dimension-schemas/dimension-schemas.component';

@Component({
  selector: 'aw-fact-type',
  standalone: true,
  imports: [
    DimensionSchemasComponent,
    MatFormFieldModule,
    MatInput,
    ReactiveFormsModule,
    ErrorContainerComponent,
    DetailHeaderComponent,
    TagsFormComponent,
    MatButton,
  ],
  providers: [FactTypeStore],
  templateUrl: './fact-type.component.html',
  styleUrl: './fact-type.component.scss',
})
export class FactTypeComponent implements OnInit {
  readonly factTypeStore = inject(FactTypeStore);
  readonly dialog = inject(MatDialog);
  destroyRef = inject(DestroyRef);
  readonly detailStore = inject(DetailStore);

  @Input() detailId!: string;

  tagsForCreate: string[] = [];

  editingRow = -1;

  factTypeForm = new FormGroup({
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
      if (this.factTypeStore.inEditMode()) {
        this.factTypeForm.enable();
      } else {
        this.factTypeForm.disable();
      }
    });
  }

  ngOnInit(): void {
    if (this.detailId) {
      if (this.detailId === CREATE_PARTIAL_URL) {
        this.factTypeStore.initializeForCreate();
      } else {
        this.factTypeStore.initialize(this.detailId).then(() => {
          this.factTypeForm.patchValue({
            key: this.factTypeStore.factType()?.key,
            name: this.factTypeStore.factType()?.name,
            description: this.factTypeStore.factType()?.description,
            dimensionSchemasCopy:
              this.factTypeStore.dimensionSchemasCopy() ?? [],
          });
        });
      }
    }

    this.factTypeForm.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if ((event as ControlEvent) instanceof FormSubmittedEvent) {
          const factTypeFormPayload: FactTypeNewType = {
            name: this.factTypeForm.value['name'] ?? '',
            key: this.factTypeForm.value['key'] ?? '',
            description: this.factTypeForm.value['description'] ?? '',
            dimensionSchemas:
              this.factTypeForm.value['dimensionSchemasCopy'] ?? [],
          };

          if (this.factTypeStore.inCreateMode()) {
            if (this.tagsForCreate.length > 0) {
              factTypeFormPayload['tags'] = this.tagsForCreate;
            }
            this.factTypeStore.create(factTypeFormPayload);
          } else {
            this.factTypeStore.update(factTypeFormPayload);
          }
        } else if (event instanceof ValueChangeEvent) {
          // auto-generate key from the user provided name
          if (event.source === this.factTypeForm.controls.name) {
            this.factTypeForm.patchValue({
              key: autoSlugify(this.factTypeForm.controls.name.value || ''),
            });
          }
        } else if (event instanceof TouchedChangeEvent) {
          // on name input blur trim name and regenerate key
          if (
            event.source === this.factTypeForm.controls.name &&
            this.factTypeForm.controls.name.value
          ) {
            const trimmedValue = this.factTypeForm.controls.name.value.trim();
            this.factTypeForm.patchValue({
              name: trimmedValue,
              key: autoSlugify(trimmedValue),
            });
          }
        }
      });
  }

  onCancel() {
    if (this.factTypeStore.inCreateMode()) {
      this.detailStore.clearDetailId();
    } else {
      // reset the form

      if (this.factTypeStore.inEditMode()) {
        this.factTypeStore.resetDimensionSchemas();
        this.factTypeForm.patchValue({
          key: this.factTypeStore.factType()?.key,
          name: this.factTypeStore.factType()?.name,
          description: this.factTypeStore.factType()?.description,
          dimensionSchemasCopy: this.factTypeStore.dimensionSchemasCopy(),
        });
        this.factTypeForm.markAsPristine();
      }
      this.factTypeStore.toggleEditMode();
    }
  }

  onDelete() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Confirm delete',
        question: 'Are you sure you want to delete this fact type?',
        okButtonText: 'Delete',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.factTypeStore.delete();
      }
    });
  }

  onSetTags(tags: string[]): void {
    this.factTypeStore.setTags(tags);
  }

  // This should only be used during object creation
  updateTagsForCreate(tags: string[]) {
    this.tagsForCreate = tags;
  }

  onCreateDimensionSchema(event: { schema: DimensionSchemaType }) {
    console.log('event=', event);
    this.factTypeStore.setDimensionSchemas(-1, event.schema);
    this.factTypeForm.controls.dimensionSchemasCopy.setValue(
      this.factTypeStore.dimensionSchemasCopy(),
    );
    this.factTypeForm.controls.dimensionSchemasCopy.markAsDirty();
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
        this.factTypeStore.setDimensionSchemas(this.editingRow, result);
        this.factTypeForm.controls.dimensionSchemasCopy.setValue(
          this.factTypeStore.dimensionSchemasCopy(),
        );
        this.factTypeForm.controls.dimensionSchemasCopy.markAsDirty();
      }
      this.editingRow = -1;
    });
  }

  onDeleteDimensionSchema(event: { index: number }) {
    this.factTypeStore.deleteDimensionSchema(event.index);
    this.factTypeForm.controls.dimensionSchemasCopy.setValue(
      this.factTypeStore.dimensionSchemasCopy(),
    );
    this.factTypeForm.controls.dimensionSchemasCopy.markAsDirty();
  }
}
