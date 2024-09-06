import {
  Component,
  DestroyRef,
  effect,
  inject,
  Input,
  OnInit,
} from '@angular/core';
import {
  AbstractControl,
  ControlEvent,
  FormControl,
  FormGroup,
  FormSubmittedEvent,
  ReactiveFormsModule,
  ValidationErrors,
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
import { DateTime } from 'luxon';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

@Component({
  selector: 'aw-event',
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
    NgxMaskDirective,
  ],
  providers: [EventStore, provideNgxMask()],
  templateUrl: './event.component.html',
  styleUrl: './event.component.scss',
})
export class EventComponent implements OnInit {
  readonly eventStore = inject(EventStore);
  private router = inject(Router);
  readonly dialog = inject(MatDialog);
  destoyRef = inject(DestroyRef);

  @Input() eventId!: string;

  eventForm = new FormGroup({
    name: new FormControl({ value: '', disabled: true }, Validators.required),
    source: new FormControl({ value: '', disabled: true }, Validators.required),
    eventType: new FormControl(
      { value: '', disabled: true },
      Validators.required,
    ),
    occurredAt: new FormControl({ value: '', disabled: true }),
    meta: new FormControl({ value: '', disabled: true }),
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
            name: this.eventStore.event()?.name,
            source: this.eventStore.event()?.source,
            eventType: this.eventStore.event()?.eventType,
            occurredAt: this.eventStore.event()?.occurredAt
              ? this.prepDateData(
                  this.eventStore
                    .event()
                    ?.occurredAt.toLocaleString(DateTime.DATETIME_SHORT),
                )
              : null,
            meta: this.eventStore.event()?.meta,
          });
        });
      }
    }

    this.eventForm.events
      .pipe(takeUntilDestroyed(this.destoyRef))
      .subscribe(event => {
        if ((event as ControlEvent) instanceof FormSubmittedEvent) {
          if (this.eventStore.inCreateMode()) {
            this.eventStore.create(this.cleanDateData());
          } else {
            this.cleanDateData();
            this.eventStore.update(this.cleanDateData());
          }
        } else if (event instanceof ValueChangeEvent) {
          // This is here for an example.  Also, there are other events that can be caught
        }
      });
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

  cleanDateData() {
    if (this.eventForm.controls.occurredAt.value) {
      return {
        ...this.eventForm.value,
        occurredAt: DateTime.fromFormat(
          this.eventForm.controls.occurredAt.value,
          'MM/dd/yyyy, hh:mm a',
        ),
      };
    } else {
      return { ...this.eventForm.value };
    }
  }

  prepDateData(dateTime: string) {
    const split = dateTime.split(/([\s/:]+)/);
    // for some reason the hour does not fill the 0 if the hour is a single digit
    const adjusted = [0, 2, 6, 8];
    for (const x of adjusted) {
      if (split[x].length === 1) {
        split[x] = '0' + split[x];
      }
    }
    const rVal = split.join('');
    return rVal;
  }
}
