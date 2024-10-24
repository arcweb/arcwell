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
import { PersonStore } from '@feature/person/person.store';
import { ErrorContainerComponent } from '@app/feature/error-container/error-container.component';
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
import { BackButtonComponent } from '@app/shared/components/back-button/back-button.component';
import { ObjectSelectorFormFieldComponent } from '@app/shared/component-library/form/object-selector-form-field/object-selector-form-field.component';
import { CohortTableComponent } from '@app/shared/components/cohort-table/cohort-table.component';
import { CohortType } from '@app/shared/schemas/cohort.schema';
import { CohortModel } from '@app/shared/models/cohort.model';
import { DetailHeaderComponent } from '@shared/components/detail-header/detail-header.component';
import { PersonNewType, PersonType } from '@app/shared/schemas/person.schema';
import { DetailStore } from '@feature/detail/detail.store';
import { DimensionComponent } from '@shared/components/dimension/dimension.component';
import { DimensionType } from '@schemas/dimension.schema';
import { DimensionDialogComponent } from '@shared/components/dialogs/dimension/dimension-dialog.component';

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
    DimensionComponent,
  ],
  providers: [PersonStore, DetailStore],
  templateUrl: './person.component.html',
  styleUrl: './person.component.scss',
})
export class PersonComponent implements OnInit {
  readonly personStore = inject(PersonStore);
  private router = inject(Router);
  readonly dialog = inject(MatDialog);
  readonly destroyRef = inject(DestroyRef);
  readonly detailStore = inject(DetailStore);

  // TODO: figure out why an initial value is required for typeKey when dynamically loading this component
  @Input() typeKey: string | undefined = undefined;
  @Input() detailId!: string;

  tagsForCreate: string[] = [];

  editingRow = -1;

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
    dimensionsCopy: new FormControl<DimensionType[]>({
      value: [],
      disabled: true,
    }),
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

  cohortColumns: string[] = ['name', 'description', 'delete'];
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
    if (this.detailId) {
      if (this.detailId === CREATE_PARTIAL_URL) {
        this.personStore.initializeForCreate();
      } else {
        this.personStore.initialize(this.detailId).then(() => {
          this.personForm.patchValue({
            familyName: this.personStore.person()?.familyName,
            givenName: this.personStore.person()?.givenName,
            personType: this.personStore.person()?.personType,
            dimensionsCopy: this.personStore.dimensionsCopy() ?? [],
          });
        });
      }
    }

    this.personForm.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if ((event as ControlEvent) instanceof FormSubmittedEvent) {
          const personFormPayload: PersonType | PersonNewType = {
            familyName: this.personForm.value['familyName'],
            givenName: this.personForm.value['givenName'],
            personType: this.personForm.value['personType'],
            dimensions: this.personForm.value['dimensionsCopy'] ?? [],
          };

          if (this.personStore.inCreateMode()) {
            if (this.tagsForCreate.length > 0) {
              personFormPayload['tags'] = this.tagsForCreate;
            }
            this.personStore.createPerson(personFormPayload);
          } else {
            this.personStore.updatePerson(personFormPayload);
          }
          this.detailStore.setDrawerOpen(false);
        }
        // else if (event instanceof ValueChangeEvent) {
        // This is here for an example.  Also, there are other events that can be caught
        // }
      });

    this.cohortForm.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if (
          (event as ControlEvent) instanceof FormSubmittedEvent &&
          this.cohortForm.value.cohort
        ) {
          this.personStore.attachCohort(this.cohortForm.value.cohort.id);
          this.cohortForm.reset();
        }
      });
  }

  onCancel() {
    if (this.personStore.inCreateMode()) {
      this.detailStore.clearDetailId();
    } else {
      // reset the form
      if (this.personStore.inEditMode()) {
        this.personStore.resetDimensions();
        this.personForm.patchValue({
          familyName: this.personStore.person()?.familyName,
          givenName: this.personStore.person()?.givenName,
          personType: this.personStore.person()?.personType,
          dimensionsCopy: this.personStore.dimensionsCopy(),
        });
        this.personForm.markAsPristine();
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
        this.personStore.deletePerson();
      }
    });
  }

  comparePersonTypes(pt1: PersonTypeType, pt2: PersonTypeType): boolean {
    return pt1 && pt2 ? pt1.id === pt2.id : false;
  }

  onSetTags(tags: string[]): void {
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
    this.router.navigate(['cohorts', 'list'], {
      queryParams: { detail_id: row.id },
    });
  }

  // This should only be used during object creation
  updateTagsForCreate(tags: string[]) {
    this.tagsForCreate = tags;
  }

  onCreateDimension(event: { schema: DimensionType }) {
    this.personStore.setDimensions(-1, event.schema);
    this.personForm.controls.dimensionsCopy.setValue(
      this.personStore.dimensionsCopy(),
    );
    this.personForm.controls.dimensionsCopy.markAsDirty();
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
        this.personStore.setDimensions(this.editingRow, result);
        this.personForm.controls.dimensionsCopy.setValue(
          this.personStore.dimensionsCopy(),
        );
        this.personForm.controls.dimensionsCopy.markAsDirty();
      }
      this.editingRow = -1;
    });
  }

  onDeleteDimension(event: { index: number }) {
    this.personStore.deleteDimensionSchema(event.index);
    this.personForm.controls.dimensionsCopy.setValue(
      this.personStore.dimensionsCopy(),
    );
    this.personForm.controls.dimensionsCopy.markAsDirty();
  }
}
