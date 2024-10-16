import { Component, inject } from '@angular/core';
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
import { DimensionSchemaType } from '@schemas/dimension-schema.schema';
import { MatCheckbox } from '@angular/material/checkbox';
import { ErrorContainerComponent } from '@feature/error-container/error-container.component';

export interface DimensionSchemaDialogData {
  title?: string;
  question?: string;
  cancelButtonText?: string;
  okButtonText?: string;
  dimensionSchema: DimensionSchemaType;
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
  templateUrl: './dimension-schema-dialog.component.html',
  styleUrl: './dimension-schema-dialog.component.scss',
})
export class DimensionSchemaDialogComponent {
  readonly data = inject<DimensionSchemaDialogData>(MAT_DIALOG_DATA);

  dimensionSchemaForm = new FormGroup({
    key: new FormControl(this.data.dimensionSchema.key ?? '', [
      Validators.required,
    ]),
    name: new FormControl(this.data.dimensionSchema.name ?? '', [
      Validators.required,
    ]),
    dataType: new FormControl(this.data.dimensionSchema.dataType ?? '', [
      Validators.required,
    ]),
    dataUnit: new FormControl(this.data.dimensionSchema.dataUnit ?? ''),
    isRequired: new FormControl(this.data.dimensionSchema.isRequired ?? true, [
      Validators.required,
    ]),
  });

  constructor() {
    console.log('data=', this.data);
  }
}
