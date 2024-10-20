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
import { FactStore } from '@feature/fact/fact.store';
import { ErrorContainerComponent } from '@app/feature/error-container/error-container.component';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { FactTypeType } from '@schemas/fact-type.schema';
import { RouterLink } from '@angular/router';
import { CREATE_PARTIAL_URL } from '@shared/constants/admin.constants';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { ConfirmationDialogComponent } from '@shared/components/dialogs/confirmation/confirmation-dialog.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TagsFormComponent } from '@shared/components/tags-form/tags-form.component';
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
import { DetailHeaderComponent } from '@shared/components/detail-header/detail-header.component';
import { FactType } from '@app/shared/schemas/fact.schema';
import { DetailStore } from '@feature/detail/detail.store';
import { NoRecordsGenericComponent } from '@shared/components/no-records-generic/no-records-generic.component';
import {
  faCirclePlus,
  faPenToSquare,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatTooltip } from '@angular/material/tooltip';
import { DimensionDialogComponent } from '@shared/components/dialogs/dimension/dimension-dialog.component';
import { DimensionType } from '@schemas/dimension.schema';
import { DimensionSchemaType } from '@schemas/dimension-schema.schema';

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
    NoRecordsGenericComponent,
    FaIconComponent,
    MatTooltip,
  ],
  providers: [FactStore],
  templateUrl: './fact.component.html',
  styleUrl: './fact.component.scss',
})
export class FactComponent implements OnInit {
  readonly factStore = inject(FactStore);
  readonly dialog = inject(MatDialog);
  readonly destroyRef = inject(DestroyRef);
  readonly detailStore = inject(DetailStore);

  @Input() detailId!: string;
  @Input() typeKey: string | undefined = undefined;

  protected readonly faPenToSquare = faPenToSquare;
  protected readonly faTrashCan = faTrashCan;
  protected readonly faCirclePlus = faCirclePlus;

  tagsForCreate: string[] = [];

  editingRow = -1;

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
    dimensionsCopy: new FormControl<DimensionType[]>({
      value: [],
      disabled: true,
    }),
  });

  displayedColumns: string[] = ['key', 'value', 'actions'];

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
    if (this.detailId) {
      if (this.detailId === CREATE_PARTIAL_URL) {
        this.factStore.initializeForCreate();
      } else {
        this.factStore.initialize(this.detailId).then(() => {
          console.log('factStore.fact()=', this.factStore.fact());
          this.factForm.patchValue({
            factType: this.factStore.fact()?.factType,
            observedAt: this.factStore.fact()?.observedAt?.toJSDate(),
            person: this.factStore.fact()?.person,
            resource: this.factStore.fact()?.resource,
            event: this.factStore.fact()?.event,
            dimensionsCopy: this.factStore.dimensionsCopy() ?? [],
          });
        });
      }
    }

    this.factForm.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if ((event as ControlEvent) instanceof FormSubmittedEvent) {
          const formValue = this.factForm.value;

          const factFormPayload: FactType = {
            factType: this.factForm.value['factType'],
            observedAt: this.factForm.value['observedAt'],
            personId: this.isObjectModel(formValue.person)
              ? formValue.person.id
              : null,
            resourceId: this.isObjectModel(formValue.resource)
              ? formValue.resource.id
              : null,
            eventId: this.isObjectModel(formValue.event)
              ? formValue.event.id
              : null,
            dimensions: this.factForm.value['dimensionsCopy'] ?? [],
          };

          if (this.factStore.inCreateMode()) {
            if (this.tagsForCreate.length > 0) {
              factFormPayload['tags'] = this.tagsForCreate;
            }
            this.factStore.createFact(factFormPayload);
          } else {
            this.factStore.updateFact(factFormPayload);
          }
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
    if (this.factStore.inCreateMode()) {
      this.detailStore.clearDetailId();
    } else {
      // reset the form
      if (this.factStore.inEditMode()) {
        this.factStore.resetDimensions();
        this.factForm.patchValue({
          factType: this.factStore.fact()?.factType,
          observedAt: this.factStore.fact()?.observedAt?.toJSDate(),
          person: this.factStore.fact()?.person,
          resource: this.factStore.fact()?.resource,
          event: this.factStore.fact()?.event,
          dimensionsCopy: this.factStore.dimensionsCopy(),
        });
        this.factForm.markAsPristine();
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
        this.factStore.deleteFact();
      }
    });
  }

  compareFactTypes(pt1: FactTypeType, pt2: FactTypeType): boolean {
    return pt1 && pt2 ? pt1.id === pt2.id : false;
  }

  onSetTags(tags: string[]): void {
    this.factStore.setTags(tags);
  }

  // This should only be used during object creation
  updateTagsForCreate(tags: string[]) {
    this.tagsForCreate = tags;
  }

  onCreateDimension() {
    const dialogRef = this.dialog.open(DimensionDialogComponent, {
      minHeight: '320px',
      width: '800px',
      data: {
        title: 'Create Dimension',
        okButtonText: 'Save',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('result', result);
      if (result) {
        this.factStore.setDimensions(-1, result);
        this.factForm.controls.dimensionsCopy.setValue(
          this.factStore.dimensionsCopy(),
        );
        this.factForm.controls.dimensionsCopy.markAsDirty();
      }
    });
  }

  onEditDimension(index: number, element: DimensionSchemaType) {
    this.editingRow = index;
    console.log('Edit row ', index, ', ', element);

    const dialogRef = this.dialog.open(DimensionDialogComponent, {
      minHeight: '320px',
      width: '800px',
      data: {
        title: 'Edit Dimension',
        dimension: element,
        okButtonText: 'Save',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.factStore.setDimensions(this.editingRow, result);
        this.factForm.controls.dimensionsCopy.setValue(
          this.factStore.dimensionsCopy(),
        );
        this.factForm.controls.dimensionsCopy.markAsDirty();
      }
      this.editingRow = -1;
    });
  }

  onDeleteDimension(index: number) {
    this.factStore.deleteDimensionSchema(index);
    this.factForm.controls.dimensionsCopy.setValue(
      this.factStore.dimensionsCopy(),
    );
    this.factForm.controls.dimensionsCopy.markAsDirty();
  }
}
