import {
  Component,
  DestroyRef,
  effect,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  ControlEvent,
  FormControl,
  FormGroup,
  FormSubmittedEvent,
  ReactiveFormsModule,
  TouchedChangeEvent,
  Validators,
  ValueChangeEvent,
} from '@angular/forms';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton, MatIconButton } from '@angular/material/button';
import { ErrorContainerComponent } from '@feature/project-management/error-container/error-container.component';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { FactTypeType } from '@schemas/fact-type.schema';
import { Router, RouterLink } from '@angular/router';
import {
  CREATE_PARTIAL_URL,
  TYPE_KEY_PATTERN,
} from '@shared/constants/admin.constants';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { ConfirmationDialogComponent } from '@shared/components/dialogs/confirmation/confirmation-dialog.component';
import { FactTypeStore } from '@feature/project-management/fact-type/fact-type.store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TagsFormComponent } from '@shared/components/tags-form/tags-form.component';
import { autoSlugify } from '@app/shared/helpers/auto-slug.helper';
import { BackButtonComponent } from '@app/shared/components/back-button/back-button.component';
import { BackService } from '@app/shared/services/back.service';
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
import { JsonPipe } from '@angular/common';
import { DetailHeaderComponent } from '../../../shared/components/detail-header/detail-header.component';
import { DetailStore } from '../detail/detail.store';

@Component({
  selector: 'aw-fact-type',
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
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatTable,
    JsonPipe,
    MatHeaderCellDef,
    DetailHeaderComponent,
  ],
  providers: [FactTypeStore],
  templateUrl: './fact-type.component.html',
  styleUrl: './fact-type.component.scss',
})
export class FactTypeComponent implements OnInit {
  readonly factTypeStore = inject(FactTypeStore);
  readonly dialog = inject(MatDialog);
  destroyRef = inject(DestroyRef);
  readonly detailStore = inject(DetailStore);

  @Input() detailId!: string;

  tagsForCreate: string[] = [];

  factTypeForm = new FormGroup({
    name: new FormControl(
      {
        value: '',
        disabled: true,
      },
      [Validators.required, Validators.minLength(3)],
    ),
    key: new FormControl(
      {
        value: '',
        disabled: true,
      },
      [Validators.pattern(TYPE_KEY_PATTERN), Validators.minLength(3)],
    ),
    description: new FormControl({
      value: '',
      disabled: true,
    }),
    dimensionSchemas: new FormControl({
      value: null,
      disabled: true,
    }),
  });

  displayedColumns: string[] = [
    'key',
    'name',
    'dataType',
    'dataUnit',
    'isRequired',
  ];

  constructor() {
    effect(() => {
      if (this.factTypeStore.inEditMode()) {
        this.factTypeForm.enable();
      } else {
        this.factTypeForm.disable();
      }
    });
  }

  ngOnInit(): void {
    if (this.detailId) {
      if (this.detailId === CREATE_PARTIAL_URL) {
        this.factTypeStore.initializeForCreate();
      } else {
        this.factTypeStore.initialize(this.detailId).then(() => {
          this.factTypeForm.patchValue({
            key: this.factTypeStore.factType()?.key,
            name: this.factTypeStore.factType()?.name,
            description: this.factTypeStore.factType()?.description,
            dimensionSchemas: this.factTypeStore.factType()?.dimensionSchemas,
          });
        });
      }
    }

    this.factTypeForm.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if ((event as ControlEvent) instanceof FormSubmittedEvent) {
          const formValue = this.factTypeForm.value;
          const dimensionsSquemaJson = formValue.dimensionSchemas
            ? JSON.parse(formValue.dimensionSchemas)
            : [];

          const factTypeFormPayload: any = {
            ...formValue,
            dimensionSchemas: dimensionsSquemaJson,
          };

          if (this.factTypeStore.inCreateMode()) {
            if (this.tagsForCreate.length > 0) {
              factTypeFormPayload['tags'] = this.tagsForCreate;
            }
            this.factTypeStore.create(factTypeFormPayload);
          } else {
            this.factTypeStore.update(factTypeFormPayload);
          }
        } else if (event instanceof ValueChangeEvent) {
          // auto-generate key from the user provided name
          if (event.source === this.factTypeForm.controls.name) {
            this.factTypeForm.patchValue({
              key: autoSlugify(this.factTypeForm.controls.name.value || ''),
            });
          }
        } else if (event instanceof TouchedChangeEvent) {
          // on name input blur trim name and regenerate key
          if (
            event.source === this.factTypeForm.controls.name &&
            this.factTypeForm.controls.name.value
          ) {
            const trimmedValue = this.factTypeForm.controls.name.value.trim();
            this.factTypeForm.patchValue({
              name: trimmedValue,
              key: autoSlugify(trimmedValue),
            });
          }
        }
      });
  }

  onCancel() {
    if (this.factTypeStore.inCreateMode()) {
      this.detailStore.clearDetailId();
    } else {
      // reset the form
      if (this.factTypeStore.inEditMode()) {
        this.factTypeForm.patchValue({
          key: this.factTypeStore.factType()?.key,
          name: this.factTypeStore.factType()?.name,
          description: this.factTypeStore.factType()?.description,
        });
      }
      this.factTypeStore.toggleEditMode();
    }
  }

  onDelete() {
    // TODO: show confirmation dialog
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Confirm delete',
        question: 'Are you sure you want to delete this fact type?',
        okButtonText: 'Delete',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.factTypeStore.delete().then(() => {
          if (this.factTypeStore.errors().length === 0) {
            this.detailStore.clearDetailId();
          }
        });
      }
    });
  }

  compareFactTypes(pt1: FactTypeType, pt2: FactTypeType): boolean {
    return pt1 && pt2 ? pt1.id === pt2.id : false;
  }

  onSetTags(tags: string[]): void {
    this.factTypeStore.setTags(tags);
  }

  // This should only be used during object creation
  updateTagsForCreate(tags: string[]) {
    this.tagsForCreate = tags;
  }
}
