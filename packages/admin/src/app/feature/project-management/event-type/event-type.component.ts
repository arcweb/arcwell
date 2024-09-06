import {
  Component,
  DestroyRef,
  effect,
  inject,
  Input,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormGroup,
  FormControl,
  Validators,
  ControlEvent,
  FormSubmittedEvent,
  ValueChangeEvent,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterLink } from '@angular/router';
import { ConfirmationDialogComponent } from '@app/shared/components/dialogs/confirmation/confirmation-dialog.component';
import { CREATE_PARTIAL_URL } from '@app/shared/constants/admin.constants';
import { EventTypeType } from '@app/shared/schemas/event-type.schema';
import { EventTypeStore } from './event-type.store';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatLabel, MatFormField, MatError } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { ErrorContainerComponent } from '../error-container/error-container.component';

@Component({
  selector: 'aw-event-type',
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
  ],
  providers: [EventTypeStore],
  templateUrl: './event-type.component.html',
  styleUrl: './event-type.component.scss',
})
export class EventTypeComponent implements OnInit {
  readonly eventTypeStore = inject(EventTypeStore);
  private router = inject(Router);
  readonly dialog = inject(MatDialog);
  destroyRef = inject(DestroyRef);

  @Input() eventTypeId!: string;

  eventTypeForm = new FormGroup({
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
      if (this.eventTypeStore.inEditMode()) {
        this.eventTypeForm.enable();
      } else {
        this.eventTypeForm.disable();
      }
    });
  }

  ngOnInit(): void {
    if (this.eventTypeId) {
      if (this.eventTypeId === CREATE_PARTIAL_URL) {
        this.eventTypeStore.initializeForCreate();
      } else {
        this.eventTypeStore.initialize(this.eventTypeId).then(() => {
          this.eventTypeForm.patchValue({
            key: this.eventTypeStore.eventType()?.key,
            name: this.eventTypeStore.eventType()?.name,
          });
        });
      }
    }

    this.eventTypeForm.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if ((event as ControlEvent) instanceof FormSubmittedEvent) {
          if (this.eventTypeStore.inCreateMode()) {
            this.eventTypeStore.create(this.eventTypeForm.value);
          } else {
            this.eventTypeStore.update(this.eventTypeForm.value);
          }
        } else if (event instanceof ValueChangeEvent) {
          // This is here for an example.  Also, there are other events that can be caught
        }
      });
  }

  onCancel() {
    if (this.eventTypeStore.inCreateMode()) {
      // TODO: This should be a back instead, but only if back doesn't take you out of app, otherwise should be the following
      this.router.navigate(['project-management', 'events', 'event-types']);
    } else {
      this.eventTypeStore.toggleEditMode();
    }
  }

  onDelete() {
    // TODO: show confirmation dialog
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Confirm delete',
        question: 'Are you sure you want to delete this event type?',
        okButtonText: 'Delete',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.eventTypeStore.delete().then(() => {
          if (this.eventTypeStore.errors().length === 0) {
            // TODO: This should be a back instead, but only if back doesn't take you out of app, otherwise should be the following
            this.router.navigate([
              'project-management',
              'events',
              'event-types',
            ]);
          }
        });
      }
    });
  }

  compareEventTypes(pt1: EventTypeType, pt2: EventTypeType): boolean {
    return pt1 && pt2 ? pt1.id === pt2.id : false;
  }
}
