import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  OnInit,
  output,
} from '@angular/core';
import { TagStore } from '@shared/components/tags-form/tags.store';
import {
  ControlEvent,
  FormControl,
  FormGroup,
  FormsModule,
  FormSubmittedEvent,
  ReactiveFormsModule,
  ValueChangeEvent,
} from '@angular/forms';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { TagType } from '@schemas/tag.schema';
import { ErrorContainerComponent } from '@app/feature/error-container/error-container.component';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatButton } from '@angular/material/button';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmationDialogComponent } from '@shared/components/dialogs/confirmation/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { DetailStore } from '@app/feature/project-management/detail/detail.store';

@Component({
  selector: 'aw-tags-form',
  standalone: true,
  imports: [
    ErrorContainerComponent,
    MatButton,
    MatIcon,
    MatChipsModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
  ],
  providers: [TagStore],
  templateUrl: './tags-form.component.html',
  styleUrl: './tags-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagsFormComponent implements OnInit {
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  readonly tagStore = inject(TagStore);
  readonly dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);
  readonly detailStore = inject(DetailStore);

  tags = input.required<TagType[]>();
  inEditMode = input<boolean>(true);

  // Special output that should only be by TagsForm when being used in create mode for an object
  updateTagsForCreate = output<TagType[]>();
  saveTags = output<TagType[]>();

  tagForm = new FormGroup({
    searchTag: new FormControl(''),
  });
  constructor() {
    effect(() => {
      console.log('input: tags changed = ', this.tags());
    });
  }

  ngOnInit() {
    this.tagStore.setObjectTags(this.tags());

    this.tagForm.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if ((event as ControlEvent) instanceof FormSubmittedEvent) {
          this.tagStore.resetForm();
          this.saveTags.emit(this.tagStore.tags());
        } else if (event instanceof ValueChangeEvent) {
          console.log('ValueChangeEvent', event.value.searchTag);
          this.tagStore.searchTags(event.value.searchTag);
        }
        // This is here for an example.  Also, there are other events that can be caught
      });
  }

  add(event: MatChipInputEvent): void {
    const tag = (event.value || '').trim();
    if (tag) {
      this.tagStore.addNewTag(tag);
      // Clear the input value
      this.tagForm.controls.searchTag.setValue('');
      this.updateTagsForCreate.emit(this.tagStore.tags());
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    console.log('addNewTag->event.option.value', event.option.value);
    this.tagStore.addNewTag(event.option.value);
    // this.tagStore.addTag(event.option.viewValue);
    this.tagForm.controls.searchTag.setValue('');
    this.updateTagsForCreate.emit(this.tagStore.tags());
    event.option.deselect();
  }

  remove(tag: TagType): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Confirm delete',
        question: 'Are you sure you want to delete this tag?',
        okButtonText: 'Delete',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.tagStore.removeTag(tag);
        this.updateTagsForCreate.emit(this.tagStore.tags());
      }
    });
  }

  onCancel() {
    // TODO: This should reset the tags to their original?  Maybe store the original copy initially and rever to that?

    // close the drawer
    this.detailStore.clearDetailId();
  }
}
