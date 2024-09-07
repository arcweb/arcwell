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
  FormsModule,
  FormSubmittedEvent,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton, MatIconButton } from '@angular/material/button';
import { PersonStore } from '@feature/project-management/person/person.store';
import { ErrorContainerComponent } from '@feature/project-management/error-container/error-container.component';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { PersonTypeType } from '@schemas/person-type.schema';
import { Router, RouterLink } from '@angular/router';
import { CREATE_PARTIAL_URL } from '@shared/constants/admin.constants';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { ConfirmationDialogComponent } from '@shared/components/dialogs/confirmation/confirmation-dialog.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TagsFormComponent } from '@shared/components/tags-form/tags-form.component';
import { TagType } from '@schemas/tag.schema';

@Component({
  selector: 'aw-person',
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
    FormsModule,
    TagsFormComponent,
  ],
  providers: [PersonStore],
  templateUrl: './person.component.html',
  styleUrl: './person.component.scss',
})
export class PersonComponent implements OnInit {
  readonly personStore = inject(PersonStore);
  private router = inject(Router);
  readonly dialog = inject(MatDialog);
  readonly destroyRef = inject(DestroyRef);

  @Input() personId!: string;

  personForm = new FormGroup({
    familyName: new FormControl(
      {
        value: '',
        disabled: true,
      },
      Validators.required,
    ),
    givenName: new FormControl(
      {
        value: '',
        disabled: true,
      },
      Validators.required,
    ),
    personType: new FormControl(
      {
        value: null,
        disabled: true,
      },
      Validators.required,
    ),
  });

  constructor() {
    effect(() => {
      if (this.personStore.inEditMode()) {
        this.personForm.enable();
      } else {
        this.personForm.disable();
      }
    });
  }

  ngOnInit(): void {
    if (this.personId) {
      if (this.personId === CREATE_PARTIAL_URL) {
        this.personStore.initializeForCreate();
      } else {
        this.personStore.initialize(this.personId).then(() => {
          this.personForm.patchValue({
            familyName: this.personStore.person()?.familyName,
            givenName: this.personStore.person()?.givenName,
            personType: this.personStore.person()?.personType,
          });
        });
      }
    }

    this.personForm.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if ((event as ControlEvent) instanceof FormSubmittedEvent) {
          if (this.personStore.inCreateMode()) {
            this.personStore.createPerson(this.personForm.value);
          } else {
            this.personStore.updatePerson(this.personForm.value);
          }
        }
        // else if (event instanceof ValueChangeEvent) {
        // }
        // This is here for an example.  Also, there are other events that can be caught
      });
  }

  onCancel() {
    if (this.personStore.inCreateMode()) {
      // TODO: This should be a back instead, but only if back doesn't take you out of app, otherwise should be the following
      this.router.navigate(['project-management', 'people', 'all-people']);
    } else {
      this.personStore.toggleEditMode();
    }
  }

  onDelete() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Confirm delete',
        question: 'Are you sure you want to delete this person?',
        okButtonText: 'Delete',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.personStore.deletePerson().then(() => {
          if (this.personStore.errors().length === 0) {
            // TODO: This should be a back instead, but only if back doesn't take you out of app, otherwise should be the following
            this.router.navigate([
              'project-management',
              'people',
              'all-people',
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
    this.personStore.setTags(tags);
  }
}
