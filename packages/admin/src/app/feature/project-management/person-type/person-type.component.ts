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
import { PersonTypeType } from '@schemas/person-type.schema';
import { Router, RouterLink } from '@angular/router';
import { CREATE_PARTIAL_URL } from '@shared/constants/admin.constants';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { ConfirmationDialogComponent } from '@shared/components/dialogs/confirmation/confirmation-dialog.component';
import { PersonTypeStore } from '@feature/project-management/person-type/person-type.store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TagType } from '@schemas/tag.schema';
import { TagsFormComponent } from '@shared/components/tags-form/tags-form.component';

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
  ],
  providers: [PersonTypeStore],
  templateUrl: './person-type.component.html',
  styleUrl: './person-type.component.scss',
})
export class PersonTypeComponent implements OnInit {
  readonly personTypeStore = inject(PersonTypeStore);
  private router = inject(Router);
  readonly dialog = inject(MatDialog);
  destroyRef = inject(DestroyRef);

  @Input() personTypeId!: string;

  personTypeForm = new FormGroup({
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
    if (this.personTypeId) {
      if (this.personTypeId === CREATE_PARTIAL_URL) {
        this.personTypeStore.initializeForCreate();
      } else {
        this.personTypeStore.initialize(this.personTypeId).then(() => {
          this.personTypeForm.patchValue({
            key: this.personTypeStore.personType()?.key,
            name: this.personTypeStore.personType()?.name,
          });
        });
      }
    }

    this.personTypeForm.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if ((event as ControlEvent) instanceof FormSubmittedEvent) {
          if (this.personTypeStore.inCreateMode()) {
            this.personTypeStore.create(this.personTypeForm.value);
          } else {
            this.personTypeStore.update(this.personTypeForm.value);
          }
        } else if (event instanceof ValueChangeEvent) {
          // This is here for an example.  Also, there are other events that can be caught
        }
      });
  }

  onCancel() {
    if (this.personTypeStore.inCreateMode()) {
      // TODO: This should be a back instead, but only if back doesn't take you out of app, otherwise should be the following
      this.router.navigate(['project-management', 'people', 'person-types']);
    } else {
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
        this.personTypeStore.delete().then(() => {
          if (this.personTypeStore.errors().length === 0) {
            // TODO: This should be a back instead, but only if back doesn't take you out of app, otherwise should be the following
            this.router.navigate([
              'project-management',
              'people',
              'person-types',
            ]);
          }
        });
      }
    });
  }

  comparePersonTypes(pt1: PersonTypeType, pt2: PersonTypeType): boolean {
    return pt1 && pt2 ? pt1.id === pt2.id : false;
  }

  onSetTags(tags: TagType[]): void {
    this.personTypeStore.setTags(tags);
  }
}
