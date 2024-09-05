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
  FormSubmittedEvent,
  ReactiveFormsModule,
  Validators,
  ValueChangeEvent,
} from '@angular/forms';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { TagType } from '@schemas/tag.schema';
import { ErrorContainerComponent } from '@feature/project-management/error-container/error-container.component';
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger,
  MatOption,
} from '@angular/material/autocomplete';
import { MatButton } from '@angular/material/button';
import {
  MatChipGrid,
  MatChipInput,
  MatChipInputEvent,
  MatChipRemove,
  MatChipRow,
} from '@angular/material/chips';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmationDialogComponent } from '@shared/components/dialogs/confirmation/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'aw-tags-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ErrorContainerComponent,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatButton,
    MatChipGrid,
    MatChipInput,
    MatChipRemove,
    MatChipRow,
    MatFormField,
    MatIcon,
    MatLabel,
    MatOption,
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

  tags = input.required<TagType[]>();
  saveTags = output<TagType[]>();

  tagForm = new FormGroup({
    tags: new FormControl([], Validators.required),
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
          this.saveTags.emit(this.tags());
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
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    console.log('addNewTag->event.option.value', event.option.value);
    this.tagStore.addNewTag(event.option.value);
    // this.tagStore.addTag(event.option.viewValue);
    this.tagForm.controls.searchTag.setValue('');
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
      }
    });
  }

  onCancel() {
    // TODO: This should reset the tags to their original?  Maybe store the original copy initially and rever to that?
  }
}
