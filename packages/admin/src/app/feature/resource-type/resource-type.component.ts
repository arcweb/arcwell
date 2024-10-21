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
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  ControlEvent,
  FormSubmittedEvent,
  ValueChangeEvent,
  TouchedChangeEvent,
} from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatLabel, MatFormField, MatError } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { ConfirmationDialogComponent } from '@app/shared/components/dialogs/confirmation/confirmation-dialog.component';
import { TagsFormComponent } from '@app/shared/components/tags-form/tags-form.component';
import {
  CREATE_PARTIAL_URL,
  TYPE_KEY_PATTERN,
} from '@app/shared/constants/admin.constants';
import { ResourceTypeType } from '@app/shared/schemas/resource-type.schema';
import { ErrorContainerComponent } from '../error-container/error-container.component';
import { ResourceTypeStore } from './resource-type.store';
import { autoSlugify } from '@app/shared/helpers/auto-slug.helper';
import { BackButtonComponent } from '@app/shared/components/back-button/back-button.component';
import { DetailHeaderComponent } from '@shared/components/detail-header/detail-header.component';
import { DetailStore } from '@feature/detail/detail.store';
import { DimensionSchemasComponent } from '@shared/components/dimension-schemas/dimension-schemas.component';
import { DimensionSchemaType } from '@schemas/dimension-schema.schema';
import { PersonTypeNewType } from '@schemas/person-type.schema';
import { DimensionSchemaDialogComponent } from '@shared/components/dialogs/dimension-schema/dimension-schema-dialog.component';

@Component({
  selector: 'aw-resource-type',
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
  providers: [ResourceTypeStore],
  templateUrl: './resource-type.component.html',
  styleUrl: './resource-type.component.scss',
})
export class ResourceTypeComponent implements OnInit {
  readonly resourceTypeStore = inject(ResourceTypeStore);
  readonly dialog = inject(MatDialog);
  destroyRef = inject(DestroyRef);
  readonly detailStore = inject(DetailStore);

  @Input() detailId!: string;

  tagsForCreate: string[] = [];
  editingRow = -1;

  resourceTypeForm = new FormGroup({
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
      if (this.resourceTypeStore.inEditMode()) {
        this.resourceTypeForm.enable();
      } else {
        this.resourceTypeForm.disable();
      }
    });
  }

  ngOnInit(): void {
    if (this.detailId) {
      if (this.detailId === CREATE_PARTIAL_URL) {
        this.resourceTypeStore.initializeForCreate();
      } else {
        this.resourceTypeStore.initialize(this.detailId).then(() => {
          this.resourceTypeForm.patchValue({
            key: this.resourceTypeStore.resourceType()?.key,
            name: this.resourceTypeStore.resourceType()?.name,
            description: this.resourceTypeStore.resourceType()?.description,
            dimensionSchemasCopy:
              this.resourceTypeStore.dimensionSchemasCopy() ?? [],
          });
        });
      }
    }

    this.resourceTypeForm.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if ((event as ControlEvent) instanceof FormSubmittedEvent) {
          const resourceTypeFormPayload: PersonTypeNewType = {
            name: this.resourceTypeForm.value['name'] ?? '',
            key: this.resourceTypeForm.value['key'] ?? '',
            description: this.resourceTypeForm.value['description'] ?? '',
            dimensionSchemas:
              this.resourceTypeForm.value['dimensionSchemasCopy'] ?? [],
          };
          if (this.resourceTypeStore.inCreateMode()) {
            // const resourceTypeFormPayload: ResourceTypeType = {
            //   ...this.resourceTypeForm.value,
            // };

            if (this.tagsForCreate.length > 0) {
              resourceTypeFormPayload['tags'] = this.tagsForCreate;
            }
            this.resourceTypeStore.create(resourceTypeFormPayload);
          } else {
            this.resourceTypeStore.update(resourceTypeFormPayload);
          }
        } else if (event instanceof ValueChangeEvent) {
          // auto-generate key from the user provided name
          if (event.source === this.resourceTypeForm.controls.name) {
            this.resourceTypeForm.patchValue({
              key: autoSlugify(this.resourceTypeForm.controls.name.value || ''),
            });
          }
        } else if (event instanceof TouchedChangeEvent) {
          // on name input blur trim name and regenerate key
          if (
            event.source === this.resourceTypeForm.controls.name &&
            this.resourceTypeForm.controls.name.value
          ) {
            const trimmedValue =
              this.resourceTypeForm.controls.name.value.trim();
            this.resourceTypeForm.patchValue({
              name: trimmedValue,
              key: autoSlugify(trimmedValue),
            });
          }
        }
      });
  }

  onCancel() {
    if (this.resourceTypeStore.inCreateMode()) {
      this.resourceTypeStore.resetDimensionSchemas();
      this.detailStore.clearDetailId();
    } else {
      // reset the form
      if (this.resourceTypeStore.inEditMode()) {
        this.resourceTypeForm.patchValue({
          key: this.resourceTypeStore.resourceType()?.key,
          name: this.resourceTypeStore.resourceType()?.name,
          description: this.resourceTypeStore.resourceType()?.description,
          dimensionSchemasCopy: this.resourceTypeStore.dimensionSchemasCopy(),
        });
      }
      this.resourceTypeStore.toggleEditMode();
    }
  }

  onDelete() {
    // TODO: show confirmation dialog
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Confirm delete',
        question: 'Are you sure you want to delete this resource type?',
        okButtonText: 'Delete',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.resourceTypeStore.delete();
      }
    });
  }

  compareResourceTypes(pt1: ResourceTypeType, pt2: ResourceTypeType): boolean {
    return pt1 && pt2 ? pt1.id === pt2.id : false;
  }

  onSetTags(tags: string[]): void {
    this.resourceTypeStore.setTags(tags);
  }

  // This should only be used during object creation
  updateTagsForCreate(tags: string[]) {
    this.tagsForCreate = tags;
  }
  onCreateDimensionSchema(event: { schema: DimensionSchemaType }) {
    console.log('event=', event);
    this.resourceTypeStore.setDimensionSchemas(-1, event.schema);
    this.resourceTypeForm.controls.dimensionSchemasCopy.setValue(
      this.resourceTypeStore.dimensionSchemasCopy(),
    );
    this.resourceTypeForm.controls.dimensionSchemasCopy.markAsDirty();
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
        this.resourceTypeStore.setDimensionSchemas(this.editingRow, result);
        this.resourceTypeForm.controls.dimensionSchemasCopy.setValue(
          this.resourceTypeStore.dimensionSchemasCopy(),
        );
        this.resourceTypeForm.controls.dimensionSchemasCopy.markAsDirty();
      }
      this.editingRow = -1;
    });
  }

  onDeleteDimensionSchema(event: { index: number }) {
    this.resourceTypeStore.deleteDimensionSchema(event.index);
    this.resourceTypeForm.controls.dimensionSchemasCopy.setValue(
      this.resourceTypeStore.dimensionSchemasCopy(),
    );
    this.resourceTypeForm.controls.dimensionSchemasCopy.markAsDirty();
  }
}
