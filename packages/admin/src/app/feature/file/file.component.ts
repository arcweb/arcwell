import { Component, DestroyRef, inject } from '@angular/core';
import { faPaperclip } from '@fortawesome/free-solid-svg-icons';
import { FileStore } from './file.store';

@Component({
  selector: 'aw-file',
  standalone: true,
  imports: [],
  templateUrl: './file.component.html',
  styleUrl: './file.component.scss',
})
export class FileComponent {
  destroyRef = inject(DestroyRef);
  fileStore = inject(FileStore);
  faPaperclip = faPaperclip;
}
