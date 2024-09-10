import {
  Component,
  DestroyRef,
  effect,
  inject,
  Input,
  OnInit,
} from '@angular/core';
import {
  ControlEvent,
  FormControl,
  FormGroup,
  FormsModule,
  FormSubmittedEvent,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton, MatIconButton } from '@angular/material/button';
import { FactStore } from '@feature/project-management/fact/fact.store';
import { ErrorContainerComponent } from '@feature/project-management/error-container/error-container.component';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { FactTypeType } from '@schemas/fact-type.schema';
import { Router, RouterLink } from '@angular/router';
import { CREATE_PARTIAL_URL } from '@shared/constants/admin.constants';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { ConfirmationDialogComponent } from '@shared/components/dialogs/confirmation/confirmation-dialog.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TagsFormComponent } from '@shared/components/tags-form/tags-form.component';
import { TagType } from '@schemas/tag.schema';
import { cleanDateData } from '@shared/helpers/date-format.helper';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

@Component({
  selector: 'aw-fact',
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
    MatSelect,
    MatIcon,
    RouterLink,
    MatIconButton,
    FormsModule,
    TagsFormComponent,
    NgxMaskDirective,
  ],
  providers: [FactStore, provideNgxMask()],
  templateUrl: './fact.component.html',
  styleUrl: './fact.component.scss',
})
export class FactComponent implements OnInit {
  readonly factStore = inject(FactStore);
  private router = inject(Router);
  readonly dialog = inject(MatDialog);
  readonly destroyRef = inject(DestroyRef);

  @Input() factId!: string;

  factForm = new FormGroup({
    factType: new FormControl(
      {
        value: null,
        disabled: true,
      },
      Validators.required,
    ),
    observedAt: new FormControl({ value: '', disabled: true }),
  });

  constructor() {
    effect(() => {
      if (this.factStore.inEditMode()) {
        this.factForm.enable();
      } else {
        this.factForm.disable();
      }
    });
  }

  ngOnInit(): void {
    if (this.factId) {
      if (this.factId === CREATE_PARTIAL_URL) {
        this.factStore.initializeForCreate();
      } else {
        this.factStore.initialize(this.factId).then(() => {
          this.factForm.patchValue({
            factType: this.factStore.fact()?.factType,
            observedAt:
              this.factStore
                .fact()
                ?.observedAt?.toFormat('MM/dd/yyyy HH:mm a') ?? null,
          });
        });
      }
    }

    this.factForm.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if ((event as ControlEvent) instanceof FormSubmittedEvent) {
          if (this.factStore.inCreateMode()) {
            this.factStore.createFact(
              cleanDateData(this.factForm, 'observedAt'),
            );
            // this.factStore.createFact(this.factForm.value);
          } else {
            this.factStore.createFact(
              cleanDateData(this.factForm, 'observedAt'),
            );
            // this.factStore.updateFact(this.factForm.value);
          }
        }
        // else if (event instanceof ValueChangeEvent) {
        // }
        // This is here for an example.  Also, there are other events that can be caught
      });
  }

  onCancel() {
    if (this.factStore.inCreateMode()) {
      // TODO: This should be a back instead, but only if back doesn't take you out of app, otherwise should be the following
      this.router.navigate(['project-management', 'facts', 'all-facts']);
    } else {
      this.factStore.toggleEditMode();
    }
  }

  onDelete() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Confirm delete',
        question: 'Are you sure you want to delete this fact?',
        okButtonText: 'Delete',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.factStore.deleteFact().then(() => {
          if (this.factStore.errors().length === 0) {
            // TODO: This should be a back instead, but only if back doesn't take you out of app, otherwise should be the following
            this.router.navigate(['project-management', 'facts', 'all-facts']);
          }
        });
      }
    });
  }

  compareFactTypes(pt1: FactTypeType, pt2: FactTypeType): boolean {
    return pt1 && pt2 ? pt1.id === pt2.id : false;
  }

  onSetTags(tags: TagType[]): void {
    this.factStore.setTags(tags);
  }
}
