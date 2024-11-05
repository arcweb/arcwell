import { Component, DestroyRef, inject, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import { BulkService } from '@app/shared/services/bulk.service';
import { BulkStore } from '@app/shared/store/bulk.store';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPaperclip } from '@fortawesome/free-solid-svg-icons';

export interface BulkImportDialogData {
  title?: string;
  types?: string[];
  apiRoute?: string;
}

@Component({
  selector: 'aw-bulk-import-dialog',
  standalone: true,
  imports: [
    MatDialogContent,
    MatButton,
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

  csvInputChange(event: any) {
    this.selectedFile = event.target.files[0];
  }

  submitForm() {
    if (this.selectedFile && this.data.apiRoute) {
      this.bulkStore.uploadCSV(this.data.apiRoute, this.selectedFile);
      // this.bulkService
      //   .uploadCsv(this.data.apiRoute, this.selectedFile)
      //   .pipe(takeUntilDestroyed(this.destroyRef))
      //   .subscribe(() => {
      //     this.complete.emit();
      //   });
    }
  }
}
