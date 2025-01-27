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
import { FileTypeStore } from '@feature/file-type/file-type.store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TagsFormComponent } from '@shared/components/tags-form/tags-form.component';
import { autoSlugify } from '@app/shared/helpers/auto-slug.helper';
import { DetailHeaderComponent } from '@shared/components/detail-header/detail-header.component';
import { FileTypeNewType } from '@schemas/file-type.schema';
import { DimensionSchemaDialogComponent } from '@shared/components/dialogs/dimension-schema/dimension-schema-dialog.component';
import { DetailStore } from '@feature/detail/detail.store';
import { DimensionSchemaType } from '@schemas/dimension-schema.schema';
import { DimensionSchemasComponent } from '@shared/components/dimension-schemas/dimension-schemas.component';

@Component({
  selector: 'aw-file-type',
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
  providers: [FileTypeStore],
  templateUrl: './file-type.component.html',
  styleUrl: './file-type.component.scss',
})
export class FileTypeComponent implements OnInit {
  readonly fileTypeStore = inject(FileTypeStore);
  readonly dialog = inject(MatDialog);
  destroyRef = inject(DestroyRef);
  readonly detailStore = inject(DetailStore);

  @Input() detailId!: string;

  tagsForCreate: string[] = [];

  editingRow = -1;

  fileTypeForm = new FormGroup({
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
      if (this.fileTypeStore.inEditMode()) {
        this.fileTypeForm.enable();
      } else {
        this.fileTypeForm.disable();
      }
    });
  }

  ngOnInit(): void {
    if (this.detailId) {
      if (this.detailId === CREATE_PARTIAL_URL) {
        this.fileTypeStore.initializeForCreate();
      } else {
        this.fileTypeStore.initialize(this.detailId).then(() => {
          this.fileTypeForm.patchValue({
            key: this.fileTypeStore.fileType()?.key,
            name: this.fileTypeStore.fileType()?.name,
            description: this.fileTypeStore.fileType()?.description,
            dimensionSchemasCopy:
              this.fileTypeStore.dimensionSchemasCopy() ?? [],
          });
        });
      }
    }

    this.fileTypeForm.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if ((event as ControlEvent) instanceof FormSubmittedEvent) {
          const fileTypeFormPayload: FileTypeNewType = {
            name: this.fileTypeForm.value['name'] ?? '',
            key: this.fileTypeForm.value['key'] ?? '',
            description: this.fileTypeForm.value['description'] ?? '',
            dimensionSchemas:
              this.fileTypeForm.value['dimensionSchemasCopy'] ?? [],
          };

          if (this.fileTypeStore.inCreateMode()) {
            if (this.tagsForCreate.length > 0) {
              fileTypeFormPayload['tags'] = this.tagsForCreate;
            }
            this.fileTypeStore.create(fileTypeFormPayload);
          } else {
            this.fileTypeStore.update(fileTypeFormPayload);
          }
        } else if (event instanceof ValueChangeEvent) {
          // auto-generate key from the user provided name
          if (event.source === this.fileTypeForm.controls.name) {
            this.fileTypeForm.patchValue({
              key: autoSlugify(this.fileTypeForm.controls.name.value || ''),
            });
          }
        } else if (event instanceof TouchedChangeEvent) {
          // on name input blur trim name and regenerate key
          if (
            event.source === this.fileTypeForm.controls.name &&
            this.fileTypeForm.controls.name.value
          ) {
            const trimmedValue = this.fileTypeForm.controls.name.value.trim();
            this.fileTypeForm.patchValue({
              name: trimmedValue,
              key: autoSlugify(trimmedValue),
            });
          }
        }
      });
  }

  onCancel() {
    if (this.fileTypeStore.inCreateMode()) {
      this.detailStore.clearDetailId();
    } else {
      // reset the form

      if (this.fileTypeStore.inEditMode()) {
        this.fileTypeStore.resetDimensionSchemas();
        this.fileTypeForm.patchValue({
          key: this.fileTypeStore.fileType()?.key,
          name: this.fileTypeStore.fileType()?.name,
          description: this.fileTypeStore.fileType()?.description,
          dimensionSchemasCopy: this.fileTypeStore.dimensionSchemasCopy(),
        });
        this.fileTypeForm.markAsPristine();
      }
      this.fileTypeStore.toggleEditMode();
    }
  }

  onDelete() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Confirm delete',
        question: 'Are you sure you want to delete this file type?',
        okButtonText: 'Delete',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.fileTypeStore.delete();
      }
    });
  }

  onSetTags(tags: string[]): void {
    this.fileTypeStore.setTags(tags);
  }

  // This should only be used during object creation
  updateTagsForCreate(tags: string[]) {
    this.tagsForCreate = tags;
  }

  onCreateDimensionSchema(event: { schema: DimensionSchemaType }) {
    console.log('event=', event);
    this.fileTypeStore.setDimensionSchemas(-1, event.schema);
    this.fileTypeForm.controls.dimensionSchemasCopy.setValue(
      this.fileTypeStore.dimensionSchemasCopy(),
    );
    this.fileTypeForm.controls.dimensionSchemasCopy.markAsDirty();
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
        this.fileTypeStore.setDimensionSchemas(this.editingRow, result);
        this.fileTypeForm.controls.dimensionSchemasCopy.setValue(
          this.fileTypeStore.dimensionSchemasCopy(),
        );
        this.fileTypeForm.controls.dimensionSchemasCopy.markAsDirty();
      }
      this.editingRow = -1;
    });
  }

  onDeleteDimensionSchema(event: { index: number }) {
    this.fileTypeStore.deleteDimensionSchema(event.index);
    this.fileTypeForm.controls.dimensionSchemasCopy.setValue(
      this.fileTypeStore.dimensionSchemasCopy(),
    );
    this.fileTypeForm.controls.dimensionSchemasCopy.markAsDirty();
  }
}
