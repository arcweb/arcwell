import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BackButtonComponent } from '../back-button/back-button.component';
import { faPenToSquare, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { MatDividerModule } from '@angular/material/divider';
@Component({
  selector: 'aw-detail-header',
  standalone: true,
  imports: [
    MatButtonModule,
    FontAwesomeModule,
    MatTooltipModule,
    BackButtonComponent,
    MatDividerModule,
  ],
  templateUrl: './detail-header.component.html',
  styleUrl: './detail-header.component.scss',
})
export class DetailHeaderComponent {
  detailName = input.required<string>();
  inEditMode = input.required<boolean>();
  inCreateMode = input.required<boolean>();

  toggleEditMode = output<void>();
  delete = output<void>();

  faPenToSquare = faPenToSquare;
  faTrashCan = faTrashCan;

  onToggleEditMode() {
    this.toggleEditMode.emit();
  }

  onDelete() {
    this.delete.emit();
  }
}
