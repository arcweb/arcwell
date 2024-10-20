import { Component, DestroyRef, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatCheckbox } from '@angular/material/checkbox';
import { ErrorContainerComponent } from '@feature/error-container/error-container.component';
import { DimensionType } from '@schemas/dimension.schema';

export interface DimensionDialogData {
  title?: string;
  question?: string;
  cancelButtonText?: string;
  okButtonText?: string;
  dimension: DimensionType;
}

@Component({
  selector: 'aw-dimension-schema-dialog',
  standalone: true,
  imports: [
    MatDialogContent,
    MatButton,
    MatDialogActions,
    MatDialogTitle,
    MatDialogClose,
    ErrorContainerComponent,
    FormsModule,
    MatError,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    MatCheckbox,
  ],
  templateUrl: './dimension-dialog.component.html',
  styleUrl: './dimension-dialog.component.scss',
})
export class DimensionDialogComponent {
  readonly data = inject<DimensionDialogData>(MAT_DIALOG_DATA);
  destroyRef = inject(DestroyRef);

  dimensionForm = new FormGroup({
    key: new FormControl(this.data.dimension?.key ?? '', [Validators.required]),
    value: new FormControl(this.data.dimension?.value ?? '', [
      Validators.required,
    ]),
  });
}
