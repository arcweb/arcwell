import { Component, DestroyRef, Input, effect, inject } from '@angular/core';
import {
  ControlEvent,
  FormControl,
  FormGroup,
  FormSubmittedEvent,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MatError,
  MatFormField,
  MatInput,
  MatLabel,
} from '@angular/material/input';
import { ErrorContainerComponent } from '../error-container/error-container.component';
import { MatOption } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { TagStore } from '@app/feature/project-management/tag/tag.store';
import { MatDialog } from '@angular/material/dialog';
import { CREATE_PARTIAL_URL } from '@app/shared/constants/admin.constants';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmationDialogComponent } from '@app/shared/components/dialogs/confirmation/confirmation-dialog.component';

@Component({
  selector: 'aw-tag',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInput,
    MatLabel,
    MatFormField,
    MatButton,
    MatError,
    ErrorContainerComponent,
    MatOption,
    MatIcon,
    RouterLink,
    MatIconButton,
    FormsModule,
  ],
  providers: [TagStore],
  templateUrl: './tag.component.html',
  styleUrl: './tag.component.scss',
})
export class TagComponent {
  readonly tagStore = inject(TagStore);
  private router = inject(Router);
  readonly dialog = inject(MatDialog);
  readonly destroyRef = inject(DestroyRef);

  @Input() tagId!: string;

  tagForm = new FormGroup({
    pathname: new FormControl(
      {
        value: '',
        disabled: true,
      },
      Validators.required,
    ),
  });

  constructor() {
    effect(() => {
      if (this.tagStore.inEditMode()) {
        this.tagForm.enable();
      } else {
        this.tagForm.disable();
      }
    });
  }

  ngOnInit(): void {
    if (this.tagId) {
      if (this.tagId === CREATE_PARTIAL_URL) {
        this.tagStore.initializeForCreate();
      } else {
        this.tagStore.initialize(this.tagId).then(() => {
          this.tagForm.patchValue({
            pathname: this.tagStore.tag()?.pathname,
          });
        });
      }
    }

    this.tagForm.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if ((event as ControlEvent) instanceof FormSubmittedEvent) {
          if (this.tagStore.inCreateMode()) {
            this.tagStore.createTag(this.tagForm.value);
          } else {
            this.tagStore.updateTag(this.tagForm.value);
          }
        }
      });
  }

  onCancel() {
    if (this.tagStore.inCreateMode()) {
      // TODO: This should be a back instead, but only if back doesn't take you out of app, otherwise should be the following
      this.router.navigate(['project-management', 'tags', 'list']);
    } else {
      this.tagStore.toggleEditMode();
    }
  }

  onDelete() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Confirm delete',
        question: 'Are you sure you want to delete this tag?',
        okButtonText: 'Delete',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.tagStore.deleteTag().then(() => {
          if (this.tagStore.errors().length === 0) {
            // TODO: This should be a back instead, but only if back doesn't take you out of app, otherwise should be the following
            this.router.navigate(['project-management', 'tags', 'list']);
          }
        });
      }
    });
  }
}
