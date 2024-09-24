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
import {
  MatTableDataSource,
} from '@angular/material/table';
import { PersonModel } from '@shared/models/person.model';
import { CohortStore } from '@feature/project-management/cohort/cohort.store';
import { ErrorContainerComponent } from '@feature/project-management/error-container/error-container.component';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { CREATE_PARTIAL_URL } from '@shared/constants/admin.constants';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { ConfirmationDialogComponent } from '@shared/components/dialogs/confirmation/confirmation-dialog.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Sort } from '@angular/material/sort';
import { TagsFormComponent } from '@shared/components/tags-form/tags-form.component';
import { TagType } from '@schemas/tag.schema';
import { PeopleTableComponent } from '@app/shared/components/people-table/people-table.component';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'aw-cohort',
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
    PeopleTableComponent
  ],
  providers: [CohortStore],
  templateUrl: './cohort.component.html',
  styleUrl: './cohort.component.scss',
})
export class CohortComponent implements OnInit {
  readonly cohortStore = inject(CohortStore);
  private router = inject(Router);
  readonly dialog = inject(MatDialog);
  readonly destroyRef = inject(DestroyRef);

  @Input() cohortId!: string;

  cohortForm = new FormGroup({
    name: new FormControl(
      {
        value: '',
        disabled: true,
      },
      Validators.required,
    ),
    description: new FormControl(
      {
        value: '',
        disabled: true,
      },
    ),
  });

  peopleColumns: string[] = [
    'id',
    'familyName',
    'givenName',
    'personType',
    'delete'
  ];
  peopleDataSource = new MatTableDataSource<PersonModel>();
  pageSizes = [10, 20, 50];

  constructor() {
    effect(() => {
      if (this.cohortStore.inEditMode()) {
        this.cohortForm.enable();
      } else {
        this.cohortForm.disable();
      }
      this.peopleDataSource.data = this.cohortStore.cohort()?.people;
    });
  }

  ngOnInit(): void {
    if (this.cohortId) {
      if (this.cohortId === CREATE_PARTIAL_URL) {
        this.cohortStore.initializeForCreate();
      } else {
        this.cohortStore.initialize(this.cohortId).then(() => {
          this.cohortForm.patchValue({
            name: this.cohortStore.cohort()?.name,
            description: this.cohortStore.cohort()?.description,
          });
        });
      }
    }

    this.cohortForm.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if ((event as ControlEvent) instanceof FormSubmittedEvent) {
          if (this.cohortStore.inCreateMode()) {
            this.cohortStore.createCohort(this.cohortForm.value);
          } else {
            this.cohortStore.updateCohort(this.cohortForm.value);
          }
        }
      });
  }

  onCancel() {
    if (this.cohortStore.inCreateMode()) {
      this.router.navigate(['project-management', 'cohorts']);
    } else {
      this.cohortStore.toggleEditMode();
    }
  }

  onDelete() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Confirm delete',
        question: 'Are you sure you want to delete this cohort?',
        okButtonText: 'Delete',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.cohortStore.deleteCohort().then(() => {
          if (this.cohortStore.errors().length === 0) {
            this.router.navigate([
              'project-management',
              'cohorts',
            ]);
          }
        });
      }
    });
  }

  onSetTags(tags: TagType[]): void {
    this.cohortStore.setTags(tags);
  }

  peoplePageChange(event: PageEvent) {
    const newOffset = event.pageIndex * event.pageSize;
    this.cohortStore.loadPeoplePage(
      event.pageSize,
      newOffset,
      event.pageIndex,
      this.cohortStore.peopleListOptions().sort,
      this.cohortStore.peopleListOptions().order,
    );
  }

  peopleRowClick(row: PersonModel) {
    this.router.navigate(['project-management', 'people', row.id]);
  }

  peopleSortChange(event: Sort) {
    this.cohortStore.loadPeoplePage(
      this.cohortStore.peopleListOptions().limit,
      this.cohortStore.peopleListOptions().offset,
      this.cohortStore.peopleListOptions().pageIndex,
      event.active,
      event.direction,
    );
  }
}
