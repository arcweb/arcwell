import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';

export interface ConfirmationDialogData {
  title?: string;
  question?: string;
  cancelButtonText?: string;
  okButtonText?: string;
}

@Component({
  selector: 'aw-confirmation-dialog',
  standalone: true,
  imports: [
    MatDialogContent,
    MatButton,
    MatDialogActions,
    MatDialogTitle,
    MatDialogClose,
  ],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.scss',
})
export class ConfirmationDialogComponent {
  readonly data = inject<ConfirmationDialogData>(MAT_DIALOG_DATA);
}
