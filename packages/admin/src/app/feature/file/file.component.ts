import {
  Component,
  DestroyRef,
  effect,
  inject,
  Input,
  OnInit,
} from '@angular/core';
import { faPaperclip } from '@fortawesome/free-solid-svg-icons';
import { FileStore } from './file.store';
import {
  ControlEvent,
  FormControl,
  FormGroup,
  FormSubmittedEvent,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { FileTypeType } from '@app/shared/schemas/file-type.schema';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DetailHeaderComponent } from '../../shared/components/detail-header/detail-header.component';
import { ErrorContainerComponent } from '../error-container/error-container.component';
import { MatButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CREATE_PARTIAL_URL } from '@app/shared/constants/admin.constants';
import { DetailStore } from '../detail/detail.store';

@Component({
  selector: 'aw-file',
  standalone: true,
  imports: [
    DetailHeaderComponent,
    ErrorContainerComponent,
    MatButton,
    MatOption,
    MatSelect,
    ReactiveFormsModule,
    MatFormField,
    MatInputModule,
    FontAwesomeModule,
  ],
  providers: [FileStore],
  templateUrl: './file.component.html',
  styleUrl: './file.component.scss',
})
export class FileComponent implements OnInit {
  readonly destroyRef = inject(DestroyRef);
  readonly detailStore = inject(DetailStore);
  fileStore = inject(FileStore);
  faPaperclip = faPaperclip;
  dialog = inject(MatDialog);

  @Input() detailId!: string;
  @Input() typeKey: string | undefined = undefined;

  tagsForCreate: string[] = [];
  editingRow = -1;

  fileForm = new FormGroup({
    name: new FormControl<string>(
      {
        value: '',
        disabled: true,
      },
      Validators.required,
    ),
    fileType: new FormControl<FileTypeType | null>(
      {
        value: null,
        disabled: true,
      },
      Validators.required,
    ),
    url: new FormControl<string | null>({
      value: null,
      disabled: true,
    }),
    file: new FormControl<File | null>({
      value: null,
      disabled: true,
    }),
  });

  selectedFile?: File;
  canDownload = false;

  fileInputChanged(event: any) {
    this.selectedFile = event.target.files[0];
    console.log(this.selectedFile);
  }

  constructor() {
    effect(() => {
      if (this.fileStore.inEditMode()) {
        this.fileForm.enable();
      } else {
        this.fileForm.disable();
      }
    });
    effect(() => {
      if (this.fileStore.fileTypes() && this.typeKey) {
        this.fileForm.patchValue({
          fileType: this.fileStore
            .fileTypes()
            .find(pt => pt.key === this.typeKey),
        });
      }
    });
  }

  ngOnInit() {
    if (this.detailId) {
      if (this.detailId === CREATE_PARTIAL_URL) {
        this.fileStore.initializeForCreate();
      } else {
        this.fileStore.initialize(this.detailId).then(() => {
          this.fileForm.patchValue({
            fileType: this.fileStore.file()?.fileType,
            name: this.fileStore.file()?.name,
          });
        });
      }
    }

    this.fileForm.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if ((event as ControlEvent) instanceof FormSubmittedEvent) {
          if (this.fileStore.inCreateMode()) {
            if (this.fileForm.valid) {
              this.fileStore.uploadFile(
                this.fileForm.controls.name.value ?? '',
                this.fileForm.controls.fileType.value,
                this.selectedFile!,
              );
            }
          } else {
            this.fileStore.updateFile(this.fileForm.value);
          }
        }
      });
  }

  compareFileTypes(pt1: FileTypeType, pt2: FileTypeType): boolean {
    return pt1 && pt2 ? pt1.id === pt2.id : false;
  }

  onCancel() {
    if (this.fileStore.inCreateMode()) {
      this.detailStore.clearDetailId();
    } else {
      if (this.fileStore.inEditMode()) {
        this.fileForm.patchValue({
          fileType: this.fileStore.file()?.fileType,
          name: this.fileStore.file()?.name,
        });
      }
    }
  }
  onDelete() {
    throw new Error('Method not implemented.');
  }
}
