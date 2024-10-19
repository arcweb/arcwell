import { Component, DestroyRef, inject, OnInit } from '@angular/core';
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
  TouchedChangeEvent,
  Validators,
  ValueChangeEvent,
} from '@angular/forms';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { DimensionSchemaType } from '@schemas/dimension-schema.schema';
import { MatCheckbox } from '@angular/material/checkbox';
import { ErrorContainerComponent } from '@feature/error-container/error-container.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { autoSlugify } from '@shared/helpers/auto-slug.helper';

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
export class DimensionSchemaDialogComponent implements OnInit {
  readonly data = inject<DimensionSchemaDialogData>(MAT_DIALOG_DATA);
  destroyRef = inject(DestroyRef);

  dimensionSchemaForm = new FormGroup({
    name: new FormControl(this.data.dimensionSchema?.name ?? '', [
      Validators.required,
    ]),
    key: new FormControl(this.data.dimensionSchema?.key ?? '', [
      Validators.required,
    ]),
    dataType: new FormControl(this.data.dimensionSchema?.dataType ?? 'number', [
      Validators.required,
    ]),
    dataUnit: new FormControl(this.data.dimensionSchema?.dataUnit ?? ''),
    isRequired: new FormControl(this.data.dimensionSchema?.isRequired ?? true, [
      Validators.required,
    ]),
  });

  constructor() {
    console.log('data=', this.data);
  }

  ngOnInit(): void {
    this.dimensionSchemaForm.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if (event instanceof ValueChangeEvent) {
          // auto-generate key from the user provided name
          if (event.source === this.dimensionSchemaForm.controls.name) {
            this.dimensionSchemaForm.patchValue({
              key: autoSlugify(
                this.dimensionSchemaForm.controls.name.value || '',
              ),
            });
          }
        } else if (event instanceof TouchedChangeEvent) {
          // on name input blur trim name and regenerate key
          if (
            event.source === this.dimensionSchemaForm.controls.name &&
            this.dimensionSchemaForm.controls.name.value
          ) {
            const trimmedValue =
              this.dimensionSchemaForm.controls.name.value.trim();
            this.dimensionSchemaForm.patchValue({
              name: trimmedValue,
              key: autoSlugify(trimmedValue),
            });
          }
        }
      });
  }
}
