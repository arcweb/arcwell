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
import { Sort, SortDirection } from '@angular/material/sort';
import { EventsTableComponent } from '@app/shared/components/events-table/events-table.component';
import { FactsTableComponent } from '@app/shared/components/facts-table/facts-table.component';
import { ResourcesTableComponent } from '@app/shared/components/resources-table/resources-table.component';
import { UsersTableComponent } from '@app/shared/components/users-table/users-table.component';
import { EventModel } from '@app/shared/models/event.model';
import { FactModel } from '@app/shared/models/fact.model';
import { ResourceModel } from '@app/shared/models/resource.model';
import { UserModel } from '@app/shared/models';

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

  peopleColumns: string[] = ['id', 'familyName', 'givenName', 'personType'];
  peopleDataSource = new MatTableDataSource<PersonModel>();

  resourcesDataSource = new MatTableDataSource<ResourceModel>();
  resourcesColumns: string[] = ['name', 'resourceType', 'tags'];

  usersDataSource = new MatTableDataSource<UserModel>();
  usersColumns: string[] = ['email', 'role', 'person', 'tags'];

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
      this.eventsDataSource.data = this.tagStore.events();
      this.factsDataSource.data = this.tagStore.facts();
      this.peopleDataSource.data = this.tagStore.people();
      this.resourcesDataSource.data = this.tagStore.resources();
      this.usersDataSource.data = this.tagStore.users();
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

  pageChange(
    objectType: string,
    sort: string,
    order: SortDirection,
    event: PageEvent,
  ) {
    const newOffset = event.pageIndex * event.pageSize;
    this.tagStore.loadRelatedPage(
      objectType,
      event.pageSize,
      newOffset,
      event.pageIndex,
      sort,
      order,
    );
  }

  rowClick(
    objectType: string,
    row: PersonModel | EventModel | FactModel | ResourceModel | UserModel,
  ) {
    switch (objectType) {
      case 'events':
        this.router.navigate(['project-management', 'events', row.id]);
        break;
      case 'facts':
        this.router.navigate(['project-management', 'facts', row.id]);
        break;
      case 'people':
        this.router.navigate(['project-management', 'people', row.id]);
        break;
      case 'resources':
        this.router.navigate(['project-management', 'resources', row.id]);
        break;
      case 'users':
        this.router.navigate([
          'project-management',
          'settings',
          'user-management',
          'all-users',
          row.id,
        ]);
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
    this.tagStore.loadRelatedPage(
      objectType,
      limit,
      offset,
      pageIndex,
      event.active,
      event.direction,
    );
  }

  viewEvent(eventId: string) {
    this.router.navigate(['project-management', 'events', eventId]);
  }

  viewResource(resourceId: string) {
    this.router.navigate(['project-management', 'resources', resourceId]);
  }

  viewPerson(personId: string) {
    this.router.navigate(['project-management', 'people', personId]);
  }
}
