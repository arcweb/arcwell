import { Component, DestroyRef, effect, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ControlEvent,
  FormControl,
  FormGroup,
  FormSubmittedEvent,
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
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPaperclip } from '@fortawesome/free-solid-svg-icons';

export interface BulkImportDialogData {
  title?: string;
  types?: string[];
  apiModel?: string;
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
export class BulkImportDialogComponent implements OnInit {
  destroyRef = inject(DestroyRef);
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

  ngOnInit(): void {
    this.bulkForm.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if ((event as ControlEvent) instanceof FormSubmittedEvent) {
          const formValue = this.bulkForm.value;
          console.log(formValue);
        }
      });
  }
  csvInputChange(event: any) {
    this.selectedFile = event.target.files[0];
  }
}
