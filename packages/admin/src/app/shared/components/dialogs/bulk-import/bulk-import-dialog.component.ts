import { Component, DestroyRef, effect, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButton } from '@angular/material/button';
import {
  MatDialogContent,
  MatDialogActions,
  MatDialogTitle,
  MatDialogClose,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormField } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { EventTypeType } from '@app/shared/schemas/event-type.schema';
import { FactTypeType } from '@app/shared/schemas/fact-type.schema';
import { PersonTypeType } from '@app/shared/schemas/person-type.schema';
import { ResourceTypeType } from '@app/shared/schemas/resource-type.schema';
import { BulkStore } from '@app/shared/store/bulk.store';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPaperclip } from '@fortawesome/free-solid-svg-icons';

export interface BulkImportDialogData {
  title?: string;
  types:
    | FactTypeType[]
    | EventTypeType[]
    | ResourceTypeType[]
    | PersonTypeType[];
  apiRoute: string;
}

@Component({
  selector: 'aw-bulk-import-dialog',
  standalone: true,
  imports: [
    MatDialogContent,
    MatButton,
    MatOption,
    MatSelect,
    MatDialogActions,
    MatDialogTitle,
    MatDialogClose,
    ReactiveFormsModule,
    MatFormField,
    MatIcon,
    MatInputModule,
    FontAwesomeModule,
  ],
  templateUrl: './bulk-import-dialog.component.html',
  styleUrl: './bulk-import-dialog.component.scss',
})
export class BulkImportDialogComponent {
  destroyRef = inject(DestroyRef);
  bulkStore = inject(BulkStore);
  faPaperclip = faPaperclip;

  bulkForm = new FormGroup({
    type: new FormControl<
      FactTypeType[] | EventTypeType[] | ResourceTypeType[] | PersonTypeType[]
    >(
      {
        value: [],
        disabled: false,
      },
      Validators.required,
    ),
    file: new FormControl(
      {
        value: null,
        disabled: false,
      },
      Validators.required,
    ),
  });
  readonly data = inject<BulkImportDialogData>(MAT_DIALOG_DATA);

  selectedFile?: File;

  constructor() {
    console.log(this.data);
    effect(() => {
      if (this.data.types) {
        this.bulkForm.patchValue({
          type: this.data.types,
        });
      }
    });
  }

  csvInputChange(event: any) {
    this.selectedFile = event.target.files[0];
  }

  submitForm() {
    if (
      this.selectedFile &&
      this.data.apiRoute &&
      this.bulkForm.controls.type.value
    ) {
      this.bulkStore.uploadCSV(
        this.data.apiRoute,
        this.bulkForm.controls.type.value,
        this.selectedFile,
      );
    }
  }
}
