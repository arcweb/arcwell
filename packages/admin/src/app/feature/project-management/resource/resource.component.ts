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
import { RouterLink, Router } from '@angular/router';
import { ConfirmationDialogComponent } from '@app/shared/components/dialogs/confirmation/confirmation-dialog.component';
import { TagsFormComponent } from '@app/shared/components/tags-form/tags-form.component';
import { CREATE_PARTIAL_URL } from '@app/shared/constants/admin.constants';
import { ResourceTypeType } from '@app/shared/schemas/resource-type.schema';
import { TagType } from '@app/shared/schemas/tag.schema';
import { ErrorContainerComponent } from '../error-container/error-container.component';
import { BackButtonComponent } from '@app/shared/components/back-button/back-button.component';
import { BackService } from '@app/shared/services/back.service';
import { DetailHeaderComponent } from '../../../shared/components/detail-header/detail-header.component';
import { ResourceType } from '@app/shared/schemas/resource.schema';

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
  ],
  providers: [ResourceStore],
  templateUrl: './resource.component.html',
  styleUrl: './resource.component.scss',
})
export class ResourceComponent implements OnInit {
  readonly resourceStore = inject(ResourceStore);
  private router = inject(Router);
  readonly dialog = inject(MatDialog);
  destoyRef = inject(DestroyRef);
  readonly backService = inject(BackService);

  @Input() resourceId!: string;
  @Input() typeKey?: string;

  tagsForCreate: TagType[] = [];

  resourceForm = new FormGroup({
    name: new FormControl({ value: '', disabled: true }, Validators.required),
    resourceType: new FormControl<ResourceTypeType | null>(
      { value: '', disabled: true },
      Validators.required,
    ),
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
    if (this.resourceId) {
      if (this.resourceId === CREATE_PARTIAL_URL) {
        this.resourceStore.initializeForCreate();
      } else {
        this.resourceStore.initialize(this.resourceId).then(() => {
          this.resourceForm.patchValue({
            name: this.resourceStore.resource()?.name,
            resourceType: this.resourceStore.resource()?.resourceType,
          });
        });
      }
    }

    this.resourceForm.events
      .pipe(takeUntilDestroyed(this.destoyRef))
      .subscribe(resource => {
        if ((resource as ControlEvent) instanceof FormSubmittedEvent) {
          if (this.resourceStore.inCreateMode()) {
            const resourceFormPayload: ResourceType = {
              ...this.resourceForm.value,
            };

            if (this.tagsForCreate.length > 0) {
              resourceFormPayload['tags'] = this.tagsForCreate;
            }
            this.resourceStore.create(resourceFormPayload);
          } else {
            this.resourceStore.update(this.resourceForm.value);
          }
        } else if (resource instanceof ValueChangeEvent) {
          // This is here for an example.  Also, there are other resources that can be caught
        }
      });
  }

  onCancel() {
    if (this.resourceStore.inCreateMode()) {
      this.backService.goBack();
    } else {
      // reset the form
      if (this.resourceStore.inEditMode()) {
        this.resourceForm.patchValue({
          name: this.resourceStore.resource()?.name,
          resourceType: this.resourceStore.resource()?.resourceType,
        });
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
        this.resourceStore.delete().then(() => {
          if (this.resourceStore.errors().length === 0) {
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
    this.resourceStore.setTags(tags);
  }

  // This should only be used during object creation
  updateTagsForCreate(tags: TagType[]) {
    this.tagsForCreate = tags;
  }
}
