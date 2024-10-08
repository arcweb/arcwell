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
import { FactStore } from '@feature/project-management/fact/fact.store';
import { ErrorContainerComponent } from '@feature/project-management/error-container/error-container.component';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { FactTypeType } from '@schemas/fact-type.schema';
import { Router, RouterLink } from '@angular/router';
import { CREATE_PARTIAL_URL } from '@shared/constants/admin.constants';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { ConfirmationDialogComponent } from '@shared/components/dialogs/confirmation/confirmation-dialog.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TagsFormComponent } from '@shared/components/tags-form/tags-form.component';
import { TagType } from '@schemas/tag.schema';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import {
  OwlDateTimeModule,
  OwlNativeDateTimeModule,
} from '@danielmoncada/angular-datetime-picker';
import { ObjectSelectorFormFieldComponent } from '@shared/component-library/form/object-selector-form-field/object-selector-form-field.component';
import { PersonType } from '@schemas/person.schema';
import { ResourceType } from '@schemas/resource.schema';
import { EventType } from '@schemas/event.schema';
import { BackButtonComponent } from '@app/shared/components/back-button/back-button.component';
import { BackService } from '@app/shared/services/back.service';
import { DetailHeaderComponent } from '../../../shared/components/detail-header/detail-header.component';

@Component({
  selector: 'aw-fact',
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
    FormsModule,
    TagsFormComponent,
    MatTable,
    MatRow,
    MatCell,
    MatHeaderCell,
    MatColumnDef,
    MatHeaderRow,
    MatRowDef,
    MatHeaderRowDef,
    MatCellDef,
    MatHeaderCellDef,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    ObjectSelectorFormFieldComponent,
    DetailHeaderComponent,
  ],
  providers: [FactStore],
  templateUrl: './fact.component.html',
  styleUrl: './fact.component.scss',
})
export class FactComponent implements OnInit {
  readonly factStore = inject(FactStore);
  private router = inject(Router);
  readonly dialog = inject(MatDialog);
  readonly destroyRef = inject(DestroyRef);
  readonly backService = inject(BackService);

  @Input() factId!: string;
  @Input() typeKey?: string;

  factForm = new FormGroup({
    factType: new FormControl<FactTypeType | null>(
      {
        value: null,
        disabled: true,
      },
      Validators.required,
    ),
    observedAt: new FormControl({ value: '', disabled: true }),
    person: new FormControl<PersonType | null>({ value: null, disabled: true }),
    resource: new FormControl<ResourceType | null>({
      value: null,
      disabled: true,
    }),
    event: new FormControl<EventType | null>({ value: null, disabled: true }),
    dimensions: new FormControl({
      value: '[]',
      disabled: true,
    }),
  });

  displayedColumns: string[] = ['key', 'value'];

  constructor() {
    effect(() => {
      if (this.factStore.inEditMode()) {
        this.factForm.enable();
      } else {
        this.factForm.disable();
      }
    });
    // update the form with the fact type if typeKey is provided in the query params
    effect(() => {
      if (this.factStore.factTypes() && this.typeKey) {
        this.factForm.patchValue({
          factType: this.factStore
            .factTypes()
            .find(pt => pt.key === this.typeKey),
        });
      }
    });
  }

  ngOnInit(): void {
    if (this.factId) {
      if (this.factId === CREATE_PARTIAL_URL) {
        this.factStore.initializeForCreate();
      } else {
        this.factStore.initialize(this.factId).then(() => {
          this.factForm.patchValue({
            factType: this.factStore.fact()?.factType,
            observedAt: this.factStore.fact()?.observedAt?.toJSDate(),
            person: this.factStore.fact()?.person,
            resource: this.factStore.fact()?.resource,
            event: this.factStore.fact()?.event,
            dimensions: this.factStore.fact()?.dimensions,
          });
        });
      }
    }

    this.factForm.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if ((event as ControlEvent) instanceof FormSubmittedEvent) {
          const formValue = this.factForm.value;

          const factFormPayload = {
            ...formValue,
            personId: this.isObjectModel(formValue.person)
              ? formValue.person.id
              : null,
            resourceId: this.isObjectModel(formValue.resource)
              ? formValue.resource.id
              : null,
            eventId: this.isObjectModel(formValue.event)
              ? formValue.event.id
              : null,
          };

          if (this.factStore.inCreateMode()) {
            this.factStore.createFact(factFormPayload);
          } else {
            this.factStore.updateFact(factFormPayload);
          }
        }
        // else if (event instanceof ValueChangeEvent) {
        // }
        // This is here for an example.  Also, there are other events that can be caught
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
    if (this.factStore.inCreateMode()) {
      this.backService.goBack();
    } else {
      // reset the form
      if (this.factStore.inEditMode()) {
        this.factForm.patchValue({
          factType: this.factStore.fact()?.factType,
          observedAt: this.factStore.fact()?.observedAt?.toJSDate(),
          person: this.factStore.fact()?.person,
          resource: this.factStore.fact()?.resource,
          event: this.factStore.fact()?.event,
        });
      }
      this.factStore.toggleEditMode();
    }
  }

  onDelete() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Confirm delete',
        question: 'Are you sure you want to delete this fact?',
        okButtonText: 'Delete',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.factStore.deleteFact().then(() => {
          if (this.factStore.errors().length === 0) {
            this.backService.goBack();
          }
        });
      }
    });
  }

  compareFactTypes(pt1: FactTypeType, pt2: FactTypeType): boolean {
    return pt1 && pt2 ? pt1.id === pt2.id : false;
  }

  onSetTags(tags: TagType[]): void {
    this.factStore.setTags(tags);
  }
}
