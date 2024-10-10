import {
  Component,
  DestroyRef,
  effect,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
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
import { TagType } from '@app/shared/schemas/tag.schema';
import { ErrorContainerComponent } from '../error-container/error-container.component';
import { ResourceTypeStore } from '../resource-type/resource-type.store';
import { autoSlugify } from '@app/shared/helpers/auto-slug.helper';
import { BackButtonComponent } from '@app/shared/components/back-button/back-button.component';
import { BackService } from '@app/shared/services/back.service';
import { DetailHeaderComponent } from '../../../shared/components/detail-header/detail-header.component';

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
  ],
  providers: [ResourceTypeStore],
  templateUrl: './resource-type.component.html',
  styleUrl: './resource-type.component.scss',
})
export class ResourceTypeComponent implements OnInit {
  readonly resourceTypeStore = inject(ResourceTypeStore);
  readonly dialog = inject(MatDialog);
  destroyRef = inject(DestroyRef);
  readonly backService = inject(BackService);

  @Input() detailId!: string;
  @Output() closeDrawer = new EventEmitter<void>();

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
          });
        });
      }
    }

    this.resourceTypeForm.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if ((event as ControlEvent) instanceof FormSubmittedEvent) {
          if (this.resourceTypeStore.inCreateMode()) {
            this.resourceTypeStore.create(this.resourceTypeForm.value);
          } else {
            this.resourceTypeStore.update(this.resourceTypeForm.value);
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
      this.backService.goBack();
    } else {
      // reset the form
      if (this.resourceTypeStore.inEditMode()) {
        this.resourceTypeForm.patchValue({
          key: this.resourceTypeStore.resourceType()?.key,
          name: this.resourceTypeStore.resourceType()?.name,
          description: this.resourceTypeStore.resourceType()?.description,
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
        this.resourceTypeStore.delete().then(() => {
          if (this.resourceTypeStore.errors().length === 0) {
            this.backService.goBack();
          }
        });
      }
    });
  }

  compareResourceTypes(pt1: ResourceTypeType, pt2: ResourceTypeType): boolean {
    return pt1 && pt2 ? pt1.id === pt2.id : false;
  }

  onSetTags(tags: TagType[]): void {
    this.resourceTypeStore.setTags(tags);
  }
}
