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
import { TagStore } from '@app/feature/tag/tag.store';
import { MatDialog } from '@angular/material/dialog';
import { CREATE_PARTIAL_URL } from '@app/shared/constants/admin.constants';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmationDialogComponent } from '@app/shared/components/dialogs/confirmation/confirmation-dialog.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { PeopleTableComponent } from '@app/shared/components/people-table/people-table.component';
import { MatTableDataSource } from '@angular/material/table';
import { PersonModel } from '@app/shared/models/person.model';
import { PageEvent } from '@angular/material/paginator';
import { Sort, SortDirection } from '@angular/material/sort';
import { EventsTableComponent } from '@app/shared/components/events-table/events-table.component';
import { FactsTableComponent } from '@app/shared/components/facts-table/facts-table.component';
import { ResourcesTableComponent } from '@app/shared/components/resources-table/resources-table.component';
import { UsersTableComponent } from '@app/shared/components/users-table/users-table.component';
import { EventModel } from '@app/shared/models/event.model';
import { FactModel } from '@app/shared/models/fact.model';
import { ResourceModel } from '@app/shared/models/resource.model';
import { UserModel } from '@app/shared/models';
import { BackButtonComponent } from '@shared/components/back-button/back-button.component';
import { DetailHeaderComponent } from '@shared/components/detail-header/detail-header.component';
import { DetailStore } from '@feature/detail/detail.store';

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
    EventsTableComponent,
    FactsTableComponent,
    PeopleTableComponent,
    ResourcesTableComponent,
    UsersTableComponent,
    DetailHeaderComponent,
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
  readonly detailStore = inject(DetailStore);

  eventsDataSource = new MatTableDataSource<EventModel>();
  eventsColumns: string[] = [
    'startedAt',
    'endedAt',
    'eventType',
    'person',
    'resource',
  ];

  factsDataSource = new MatTableDataSource<FactModel>();
  factsColumns: string[] = [
    'factType',
    'person',
    'resource',
    'event',
    'observedAt',
  ];

  peopleColumns: string[] = ['familyName', 'givenName', 'personType'];
  peopleDataSource = new MatTableDataSource<PersonModel>();

  resourcesDataSource = new MatTableDataSource<ResourceModel>();
  resourcesColumns: string[] = ['name', 'resourceType', 'tags'];

  usersDataSource = new MatTableDataSource<UserModel>();
  usersColumns: string[] = ['email', 'role', 'person', 'tags'];

  pageSizes = [10, 20, 50];

  @Input() detailId!: string;

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
      this.eventsDataSource.data = this.tagStore.events();
      this.factsDataSource.data = this.tagStore.facts();
      this.peopleDataSource.data = this.tagStore.people();
      this.resourcesDataSource.data = this.tagStore.resources();
      this.usersDataSource.data = this.tagStore.users();
    });
  }

  ngOnInit(): void {
    if (this.detailId) {
      if (this.detailId === CREATE_PARTIAL_URL) {
        this.tagStore.initializeForCreate();
      } else {
        this.tagStore.initialize(this.detailId).then(() => {
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
      this.detailStore.clearDetailId();
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
        this.tagStore.deleteTag();
      }
    });
  }

  pageChange(
    objectType: string,
    sort: string,
    order: SortDirection,
    event: PageEvent,
  ) {
    const newOffset = event.pageIndex * event.pageSize;
    this.tagStore.loadRelatedPage({
      objectType,
      limit: event.pageSize,
      offset: newOffset,
      pageIndex: event.pageIndex,
      sort,
      order,
    });
  }

  rowClick(
    objectType: string,
    row: PersonModel | EventModel | FactModel | ResourceModel | UserModel,
  ) {
    switch (objectType) {
      case 'events':
        this.router.navigate(['events', 'list'], {
          queryParams: { detail_id: row.id },
        });
        break;
      case 'facts':
        this.router.navigate(['facts', 'list'], {
          queryParams: { detail_id: row.id },
        });
        break;
      case 'people':
        this.router.navigate(['people', 'list'], {
          queryParams: { detail_id: row.id },
        });
        break;
      case 'resources':
        this.router.navigate(['resources', 'list'], {
          queryParams: { detail_id: row.id },
        });
        break;
      case 'users':
        this.router.navigate(['settings', 'users'], {
          queryParams: { detail_id: row.id },
        });
        break;
    }
  }

  sortChange(
    objectType: string,
    limit: number,
    offset: number,
    pageIndex: number,
    event: Sort,
  ) {
    this.tagStore.loadRelatedPage({
      objectType,
      limit,
      offset,
      pageIndex,
      sort: event.active,
      order: event.direction,
    });
  }

  viewEvent(eventId: string) {
    this.router.navigate(['events', 'list'], {
      queryParams: { detail_id: eventId },
    });
  }

  viewResource(resourceId: string) {
    this.router.navigate(['resources', 'list'], {
      queryParams: { detail_id: resourceId },
    });
  }

  viewPerson(personId: string) {
    this.router.navigate(['people', 'list'], {
      queryParams: { detail_id: personId },
    });
  }
}
