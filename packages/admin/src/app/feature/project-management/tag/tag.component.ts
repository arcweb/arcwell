import {
  Component,
  DestroyRef,
  Input,
  effect,
  inject,
  OnInit,
} from '@angular/core';
import {
  ControlEvent,
  FormControl,
  FormGroup,
  FormSubmittedEvent,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MatError,
  MatFormField,
  MatInput,
  MatLabel,
} from '@angular/material/input';
import { ErrorContainerComponent } from '../error-container/error-container.component';
import { MatOption } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { TagStore } from '@app/feature/project-management/tag/tag.store';
import { MatDialog } from '@angular/material/dialog';
import { CREATE_PARTIAL_URL } from '@app/shared/constants/admin.constants';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmationDialogComponent } from '@app/shared/components/dialogs/confirmation/confirmation-dialog.component';
import { BackButtonComponent } from '../../../shared/components/back-button/back-button.component';
import { BackService } from '@app/shared/services/back.service';
import { MatExpansionModule } from '@angular/material/expansion';
import { PeopleTableComponent } from '@app/shared/components/people-table/people-table.component';
import { MatTableDataSource } from '@angular/material/table';
import { PersonModel } from '@app/shared/models/person.model';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';

@Component({
  selector: 'aw-tag',
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
    MatIcon,
    RouterLink,
    MatIconButton,
    FormsModule,
    BackButtonComponent,
    MatExpansionModule,
    PeopleTableComponent,
  ],
  providers: [TagStore],
  templateUrl: './tag.component.html',
  styleUrl: './tag.component.scss',
})
export class TagComponent implements OnInit {
  readonly tagStore = inject(TagStore);
  private router = inject(Router);
  readonly dialog = inject(MatDialog);
  readonly destroyRef = inject(DestroyRef);
  readonly backService = inject(BackService);

  peopleColumns: string[] = ['id', 'familyName', 'givenName', 'personType'];
  peopleDataSource = new MatTableDataSource<PersonModel>();

  pageSizes = [10, 20, 50];

  @Input() tagId!: string;

  tagForm = new FormGroup({
    pathname: new FormControl(
      {
        value: '',
        disabled: true,
      },
      Validators.required,
    ),
  });

  constructor() {
    effect(() => {
      if (this.tagStore.inEditMode()) {
        this.tagForm.enable();
      } else {
        this.tagForm.disable();
      }

      this.peopleDataSource.data = this.tagStore.people();
    });
  }

  ngOnInit(): void {
    if (this.tagId) {
      if (this.tagId === CREATE_PARTIAL_URL) {
        this.tagStore.initializeForCreate();
      } else {
        this.tagStore.initialize(this.tagId).then(() => {
          this.tagForm.patchValue({
            pathname: this.tagStore.tag()?.pathname,
          });
        });
      }
    }

    this.tagForm.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if ((event as ControlEvent) instanceof FormSubmittedEvent) {
          if (this.tagStore.inCreateMode()) {
            this.tagStore.createTag(this.tagForm.value);
          } else {
            this.tagStore.updateTag(this.tagForm.value);
          }
        }
      });
  }

  onCancel() {
    if (this.tagStore.inCreateMode()) {
      this.backService.goBack();
    } else {
      // reset the form
      if (this.tagStore.inEditMode()) {
        this.tagForm.patchValue({
          pathname: this.tagStore.tag()?.pathname,
        });
      }
      this.tagStore.toggleEditMode();
    }
  }

  onDelete() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Confirm delete',
        question: 'Are you sure you want to delete this tag?',
        okButtonText: 'Delete',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.tagStore.deleteTag().then(() => {
          if (this.tagStore.errors().length === 0) {
            this.backService.goBack();
          }
        });
      }
    });
  }

  pageChange(objectType: string, event: PageEvent) {
    const newOffset = event.pageIndex * event.pageSize;
    this.tagStore.loadRelatedPage(
      objectType,
      event.pageSize,
      newOffset,
      event.pageIndex,
      this.tagStore.peopleListOptions().sort,
      this.tagStore.peopleListOptions().order,
    );
  }

  rowClick(objectType: string, row: PersonModel) {
    switch (objectType) {
      case 'people':
        this.router.navigate(['project-management', 'people', row.id]);
        break;
    }
  }

  sortChange(objectType: string, event: Sort) {
    this.tagStore.loadRelatedPage(
      objectType,
      this.tagStore.peopleListOptions().limit,
      this.tagStore.peopleListOptions().offset,
      this.tagStore.peopleListOptions().pageIndex,
      event.active,
      event.direction,
    );
  }
}
