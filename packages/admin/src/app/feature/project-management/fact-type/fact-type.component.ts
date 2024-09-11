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
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton, MatIconButton } from '@angular/material/button';
import { ErrorContainerComponent } from '@feature/project-management/error-container/error-container.component';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { FactTypeType } from '@schemas/fact-type.schema';
import { Router, RouterLink } from '@angular/router';
import { CREATE_PARTIAL_URL } from '@shared/constants/admin.constants';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { ConfirmationDialogComponent } from '@shared/components/dialogs/confirmation/confirmation-dialog.component';
import { FactTypeStore } from '@feature/project-management/fact-type/fact-type.store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TagType } from '@schemas/tag.schema';
import { TagsFormComponent } from '@shared/components/tags-form/tags-form.component';

@Component({
  selector: 'aw-fact-type',
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
  ],
  providers: [FactTypeStore],
  templateUrl: './fact-type.component.html',
  styleUrl: './fact-type.component.scss',
})
export class FactTypeComponent implements OnInit {
  readonly factTypeStore = inject(FactTypeStore);
  private router = inject(Router);
  readonly dialog = inject(MatDialog);
  destroyRef = inject(DestroyRef);

  @Input() factTypeId!: string;

  factTypeForm = new FormGroup({
    key: new FormControl(
      {
        value: '',
        disabled: true,
      },
      Validators.required,
    ),
    name: new FormControl(
      {
        value: '',
        disabled: true,
      },
      Validators.required,
    ),
    description: new FormControl({
      value: '',
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
    if (this.factTypeId) {
      if (this.factTypeId === CREATE_PARTIAL_URL) {
        this.factTypeStore.initializeForCreate();
      } else {
        this.factTypeStore.initialize(this.factTypeId).then(() => {
          this.factTypeForm.patchValue({
            key: this.factTypeStore.factType()?.key,
            name: this.factTypeStore.factType()?.name,
            description: this.factTypeStore.factType()?.description,
          });
        });
      }
    }

    this.factTypeForm.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if ((event as ControlEvent) instanceof FormSubmittedEvent) {
          if (this.factTypeStore.inCreateMode()) {
            this.factTypeStore.create(this.factTypeForm.value);
          } else {
            this.factTypeStore.update(this.factTypeForm.value);
          }
        } else if (event instanceof ValueChangeEvent) {
          // This is here for an example.  Also, there are other events that can be caught
        }
      });
  }

  onCancel() {
    if (this.factTypeStore.inCreateMode()) {
      // TODO: This should be a back instead, but only if back doesn't take you out of app, otherwise should be the following
      this.router.navigate(['project-management', 'facts', 'fact-types']);
    } else {
      this.factTypeStore.toggleEditMode();
    }
  }

  onDelete() {
    // TODO: show confirmation dialog
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Confirm delete',
        question: 'Are you sure you want to delete this fact type?',
        okButtonText: 'Delete',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.factTypeStore.delete().then(() => {
          if (this.factTypeStore.errors().length === 0) {
            // TODO: This should be a back instead, but only if back doesn't take you out of app, otherwise should be the following
            this.router.navigate(['project-management', 'facts', 'fact-types']);
          }
        });
      }
    });
  }

  compareFactTypes(pt1: FactTypeType, pt2: FactTypeType): boolean {
    return pt1 && pt2 ? pt1.id === pt2.id : false;
  }

  onSetTags(tags: TagType[]): void {
    this.factTypeStore.setTags(tags);
  }
}
