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
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatLabel, MatFormField, MatError } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { ErrorContainerComponent } from '../error-container/error-container.component';
import { EventStore } from './event.store';
import { MatDialog } from '@angular/material/dialog';
import { CREATE_PARTIAL_URL } from '@app/shared/constants/admin.constants';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmationDialogComponent } from '@app/shared/components/dialogs/confirmation/confirmation-dialog.component';
import { EventTypeType } from '@app/shared/schemas/event-type.schema';
import { TagsFormComponent } from '@shared/components/tags-form/tags-form.component';
import { TagType } from '@schemas/tag.schema';
import {
  OwlDateTimeModule,
  OwlNativeDateTimeModule,
} from '@danielmoncada/angular-datetime-picker';
import { ObjectSelectorFormFieldComponent } from '@shared/component-library/form/object-selector-form-field/object-selector-form-field.component';
import { PersonType } from '@schemas/person.schema';
import { ResourceType } from '@schemas/resource.schema';
import { BackButtonComponent } from '@app/shared/components/back-button/back-button.component';

@Component({
  selector: 'aw-event',
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
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    ObjectSelectorFormFieldComponent,
  ],
  providers: [EventStore],
  templateUrl: './event.component.html',
  styleUrl: './event.component.scss',
})
export class EventComponent implements OnInit {
  readonly eventStore = inject(EventStore);
  private router = inject(Router);
  readonly dialog = inject(MatDialog);
  destroyRef = inject(DestroyRef);

  @Input() eventId!: string;

  eventForm = new FormGroup({
    eventType: new FormControl(
      { value: '', disabled: true },
      Validators.required,
    ),
    startedAt: new FormControl(
      { value: '', disabled: true },
      Validators.required,
    ),
    endedAt: new FormControl({ value: '', disabled: true }),
    // info: new FormControl({ value: '', disabled: true }),
    person: new FormControl<PersonType | null>({ value: null, disabled: true }),
    resource: new FormControl<ResourceType | null>({
      value: null,
      disabled: true,
    }),
  });

  constructor() {
    effect(() => {
      if (this.eventStore.inEditMode()) {
        this.eventForm.enable();
      } else {
        this.eventForm.disable();
      }
    });
  }

  ngOnInit(): void {
    if (this.eventId) {
      if (this.eventId === CREATE_PARTIAL_URL) {
        this.eventStore.initializeForCreate();
      } else {
        this.eventStore.initialize(this.eventId).then(() => {
          this.eventForm.patchValue({
            eventType: this.eventStore.event()?.eventType,
            startedAt: this.eventStore.event()?.startedAt
              ? this.eventStore.event()?.startedAt.toJSDate()
              : null,
            endedAt: this.eventStore.event()?.endedAt
              ? this.eventStore.event()?.endedAt.toJSDate()
              : null,
            // info: this.eventStore.event()?.info,
            person: this.eventStore.event()?.person,
            resource: this.eventStore.event()?.resource,
          });
        });
      }
    }

    this.eventForm.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if ((event as ControlEvent) instanceof FormSubmittedEvent) {
          const formValue = this.eventForm.value;

          const eventFormPayload = {
            ...formValue,
            personId: this.isObjectModel(formValue.person)
              ? formValue.person.id
              : null,
            resourceId: this.isObjectModel(formValue.resource)
              ? formValue.resource.id
              : null,
          };

          if (this.eventStore.inCreateMode()) {
            this.eventStore.create(eventFormPayload);
          } else {
            this.eventStore.update(eventFormPayload);
          }
        } else if (event instanceof ValueChangeEvent) {
          // This is here for an example.  Also, there are other events that can be caught
        }
      });
  }

  isObjectModel(obj: unknown) {
    return (
      obj &&
      typeof obj === 'object' &&
      'id' in obj &&
      typeof obj.id === 'string'
    );
  }

  onCancel() {
    if (this.eventStore.inCreateMode()) {
      // TODO: This should be a back instead, but only if back doesn't take you out of app, otherwise should be the following
      this.router.navigate(['project-management', 'events', 'all-events']);
    } else {
      this.eventStore.toggleEditMode();
    }
  }

  onDelete() {
    // TODO: show confirmation dialog
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Confirm delete',
        question: 'Are you sure you want to delete this event?',
        okButtonText: 'Delete',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.eventStore.delete().then(() => {
          if (this.eventStore.errors().length === 0) {
            // TODO: This should be a back instead, but only if back doesn't take you out of app, otherwise should be the following
            this.router.navigate([
              'project-management',
              'events',
              'all-events',
            ]);
          }
        });
      }
    });
  }

  compareEventTypes(pt1: EventTypeType, pt2: EventTypeType): boolean {
    return pt1 && pt2 ? pt1.id === pt2.id : false;
  }

  onSetTags(tags: TagType[]): void {
    this.eventStore.setTags(tags);
  }
}
