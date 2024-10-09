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
import { PageEvent } from '@angular/material/paginator';
import { PersonTypeType } from '@schemas/person-type.schema';
import { Router, RouterLink } from '@angular/router';
import { CREATE_PARTIAL_URL } from '@shared/constants/admin.constants';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmationDialogComponent } from '@shared/components/dialogs/confirmation/confirmation-dialog.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TagsFormComponent } from '@shared/components/tags-form/tags-form.component';
import { TagType } from '@schemas/tag.schema';
import { BackButtonComponent } from '@app/shared/components/back-button/back-button.component';
import { BackService } from '@app/shared/services/back.service';
import { ObjectSelectorFormFieldComponent } from '@app/shared/component-library/form/object-selector-form-field/object-selector-form-field.component';
import { CohortTableComponent } from '@app/shared/components/cohort-table/cohort-table.component';
import { CohortType } from '@app/shared/schemas/cohort.schema';
import { CohortModel } from '@app/shared/models/cohort.model';
import { DetailHeaderComponent } from '../../../shared/components/detail-header/detail-header.component';
import { PersonType } from '@app/shared/schemas/person.schema';

@Component({
  selector: 'aw-person',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    BackButtonComponent,
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
    ObjectSelectorFormFieldComponent,
    CohortTableComponent,
    DetailHeaderComponent,
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
  readonly backService = inject(BackService);

  @Input() personId!: string;
  @Input() typeKey?: string;

  tagsForCreate: TagType[] = [];

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
    personType: new FormControl<PersonTypeType | null>(
      {
        value: null,
        disabled: true,
      },
      Validators.required,
    ),
  });

  cohortForm = new FormGroup({
    cohort: new FormControl<CohortType | null>(
      {
        value: null,
        disabled: true,
      },
      Validators.required,
    ),
  });

  cohortColumns: string[] = ['id', 'name', 'description', 'delete'];
  cohortsDataSource = new MatTableDataSource<CohortModel>();
  pageSizes = [10, 20, 50];

  constructor() {
    effect(() => {
      if (this.personStore.inEditMode()) {
        this.personForm.enable();
        this.cohortForm.disable();
      } else {
        this.personForm.disable();
        this.cohortForm.enable();
      }
      this.cohortsDataSource.data = this.personStore.person()?.cohorts;
    });
    // update the form with the person type if typeKey is provided in the query params
    effect(() => {
      if (this.personStore.personTypes() && this.typeKey) {
        this.personForm.patchValue({
          personType: this.personStore
            .personTypes()
            .find(pt => pt.key === this.typeKey),
        });
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
            const personFormPayload: PersonType = {
              ...this.personForm.value,
            };

            if (this.tagsForCreate.length > 0) {
              personFormPayload['tags'] = this.tagsForCreate;
            }
            this.personStore.createPerson(personFormPayload);
          } else {
            this.personStore.updatePerson(this.personForm.value);
          }
        }
        // else if (event instanceof ValueChangeEvent) {
        // This is here for an example.  Also, there are other events that can be caught
        // }
      });

    this.cohortForm.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if ((event as ControlEvent) instanceof FormSubmittedEvent) {
          this.personStore.attachCohort(this.cohortForm.value.cohort.id);
          this.cohortForm.reset();
        }
      });
  }

  onCancel() {
    if (this.personStore.inCreateMode()) {
      this.backService.goBack();
    } else {
      // reset the form
      if (this.personStore.inEditMode()) {
        this.personForm.patchValue({
          familyName: this.personStore.person()?.familyName,
          givenName: this.personStore.person()?.givenName,
          personType: this.personStore.person()?.personType,
        });
      }
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
            this.backService.goBack();
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

  cohortsDeleteClick(cohortId: string) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Confirm removal of cohort from person',
        question:
          'Are you sure you want to remove this cohort from the person?',
        okButtonText: 'Remove',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.personStore.detachCohort(cohortId);
      }
    });
  }

  cohortsPageChange(event: PageEvent) {
    const newOffset = event.pageIndex * event.pageSize;
    this.personStore.loadCohortsPage(
      event.pageSize,
      newOffset,
      event.pageIndex,
    );
  }

  cohortsRowClick(row: CohortModel) {
    this.router.navigate(['project-management', 'cohorts', row.id]);
  }

  // This should only be used during object creation
  updateTagsForCreate(tags: TagType[]) {
    this.tagsForCreate = tags;
  }
}
