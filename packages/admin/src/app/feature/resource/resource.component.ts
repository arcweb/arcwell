import {
  Component,
  DestroyRef,
  effect,
  inject,
  Input,
  OnInit,
} from '@angular/core';
import { ResourceStore } from './resource.store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  ValueChangeEvent,
  ControlEvent,
  FormSubmittedEvent,
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
import { CREATE_PARTIAL_URL } from '@app/shared/constants/admin.constants';
import { ResourceTypeType } from '@app/shared/schemas/resource-type.schema';
import { ErrorContainerComponent } from '../error-container/error-container.component';
import { BackButtonComponent } from '@app/shared/components/back-button/back-button.component';
import { DetailHeaderComponent } from '@shared/components/detail-header/detail-header.component';
import { DetailStore } from '@feature/detail/detail.store';
import {
  ResourceNewType,
  ResourceType,
} from '@app/shared/schemas/resource.schema';
import { DimensionComponent } from '@shared/components/dimension/dimension.component';
import { DimensionType } from '@schemas/dimension.schema';
import { DimensionDialogComponent } from '@shared/components/dialogs/dimension/dimension-dialog.component';

@Component({
  selector: 'aw-resource',
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
    DimensionComponent,
  ],
  providers: [ResourceStore],
  templateUrl: './resource.component.html',
  styleUrl: './resource.component.scss',
})
export class ResourceComponent implements OnInit {
  readonly resourceStore = inject(ResourceStore);
  readonly dialog = inject(MatDialog);
  destroyRef = inject(DestroyRef);
  readonly detailStore = inject(DetailStore);

  @Input() detailId!: string;
  @Input() typeKey: string | undefined = undefined;

  tagsForCreate: string[] = [];

  editingRow = -1;

  resourceForm = new FormGroup({
    name: new FormControl({ value: '', disabled: true }, Validators.required),
    resourceType: new FormControl<ResourceTypeType | null>(
      { value: '', disabled: true },
      Validators.required,
    ),
    dimensionsCopy: new FormControl<DimensionType[]>({
      value: [],
      disabled: true,
    }),
  });

  constructor() {
    effect(() => {
      if (this.resourceStore.inEditMode()) {
        this.resourceForm.enable();
      } else {
        this.resourceForm.disable();
      }
    });
    effect(() => {
      if (this.resourceStore.resourceTypes() && this.typeKey) {
        this.resourceForm.patchValue({
          resourceType: this.resourceStore
            .resourceTypes()
            .find(rt => rt.key === this.typeKey),
        });
      }
    });
  }

  ngOnInit(): void {
    if (this.detailId) {
      if (this.detailId === CREATE_PARTIAL_URL) {
        this.resourceStore.initializeForCreate();
      } else {
        this.resourceStore.initialize(this.detailId).then(() => {
          this.resourceForm.patchValue({
            name: this.resourceStore.resource()?.name,
            resourceType: this.resourceStore.resource()?.resourceType,
            dimensionsCopy: this.resourceStore.dimensionsCopy() ?? [],
          });
        });
      }
    }

    this.resourceForm.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(resource => {
        if ((resource as ControlEvent) instanceof FormSubmittedEvent) {
          const resourceFormPayload: ResourceType | ResourceNewType = {
            ...this.resourceForm.value,
            dimensions: this.resourceForm.value['dimensionsCopy'] ?? [],
          };
          if (this.resourceStore.inCreateMode()) {
            if (this.tagsForCreate.length > 0) {
              resourceFormPayload['tags'] = this.tagsForCreate;
            }
            this.resourceStore.create(resourceFormPayload);
          } else {
            this.resourceStore.update(resourceFormPayload);
          }
        } else if (resource instanceof ValueChangeEvent) {
          // This is here for an example.  Also, there are other resources that can be caught
        }
      });
  }

  onCancel() {
    if (this.resourceStore.inCreateMode()) {
      this.resourceStore.resetDimensions();
      this.detailStore.clearDetailId();
    } else {
      // reset the form
      if (this.resourceStore.inEditMode()) {
        this.resourceForm.patchValue({
          name: this.resourceStore.resource()?.name,
          resourceType: this.resourceStore.resource()?.resourceType,
          dimensionsCopy: this.resourceStore.dimensionsCopy(),
        });
        this.resourceForm.markAsPristine();
      }
      this.resourceStore.toggleEditMode();
    }
  }

  onDelete() {
    // TODO: show confirmation dialog
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Confirm delete',
        question: 'Are you sure you want to delete this resource?',
        okButtonText: 'Delete',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.resourceStore.delete();
      }
    });
  }

  compareResourceTypes(pt1: ResourceTypeType, pt2: ResourceTypeType): boolean {
    return pt1 && pt2 ? pt1.id === pt2.id : false;
  }

  onSetTags(tags: string[]): void {
    this.resourceStore.setTags(tags);
  }

  // This should only be used during object creation
  updateTagsForCreate(tags: string[]) {
    this.tagsForCreate = tags;
  }

  onCreateDimension(event: { schema: DimensionType }) {
    this.resourceStore.setDimensions(-1, event.schema);
    this.resourceForm.controls.dimensionsCopy.setValue(
      this.resourceStore.dimensionsCopy(),
    );
    this.resourceForm.controls.dimensionsCopy.markAsDirty();
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
        this.resourceStore.setDimensions(this.editingRow, result);
        this.resourceForm.controls.dimensionsCopy.setValue(
          this.resourceStore.dimensionsCopy(),
        );
        this.resourceForm.controls.dimensionsCopy.markAsDirty();
      }
      this.editingRow = -1;
    });
  }

  onDeleteDimension(event: { index: number }) {
    this.resourceStore.deleteDimensionSchema(event.index);
    this.resourceForm.controls.dimensionsCopy.setValue(
      this.resourceStore.dimensionsCopy(),
    );
    this.resourceForm.controls.dimensionsCopy.markAsDirty();
  }
}
