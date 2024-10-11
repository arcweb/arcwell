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
import { TagType } from '@app/shared/schemas/tag.schema';
import { ErrorContainerComponent } from '../error-container/error-container.component';
import { BackButtonComponent } from '@app/shared/components/back-button/back-button.component';
import { DetailHeaderComponent } from '../../../shared/components/detail-header/detail-header.component';
import { DetailStore } from '../detail/detail.store';

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
  readonly dialog = inject(MatDialog);
  destoyRef = inject(DestroyRef);
  readonly detailStore = inject(DetailStore);

  @Input() detailId!: string;
  @Input() typeKey: string | undefined = undefined;

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
    if (this.detailId) {
      if (this.detailId === CREATE_PARTIAL_URL) {
        this.resourceStore.initializeForCreate();
      } else {
        this.resourceStore.initialize(this.detailId).then(() => {
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
            this.resourceStore.create(this.resourceForm.value);
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
      this.detailStore.clearDetailId();
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
            this.detailStore.clearDetailId();
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
}
