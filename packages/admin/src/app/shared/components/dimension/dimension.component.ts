import { Component, inject, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BackButtonComponent } from '../back-button/back-button.component';
import {
  faPenToSquare,
  faTrashCan,
  faCirclePlus,
} from '@fortawesome/free-solid-svg-icons';
import { MatDividerModule } from '@angular/material/divider';
import { NoRecordsGenericComponent } from '@shared/components/no-records-generic/no-records-generic.component';
import { MatTableModule } from '@angular/material/table';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { DimensionType } from '@schemas/dimension.schema';
import { DimensionDialogComponent } from '@shared/components/dialogs/dimension/dimension-dialog.component';
@Component({
  selector: 'aw-dimension',
  standalone: true,
  imports: [
    MatButtonModule,
    FontAwesomeModule,
    MatTooltipModule,
    BackButtonComponent,
    MatDividerModule,
    NoRecordsGenericComponent,
    MatTableModule,
    MatCheckbox,
  ],
  templateUrl: './dimension.component.html',
  styleUrl: './dimension.component.scss',
})
export class DimensionComponent {
  readonly dialog = inject(MatDialog);

  inEditMode = input.required<boolean>();
  dimensionsCopy = input.required<DimensionType[]>();

  onEditDimension = output<{
    index: number;
    element: DimensionType;
  }>();
  onDeleteDimension = output<{ index: number }>();
  onCreateDimension = output<{ schema: DimensionType }>();

  displayedColumns: string[] = ['key', 'value', 'actions'];

  protected readonly faPenToSquare = faPenToSquare;
  protected readonly faTrashCan = faTrashCan;
  protected readonly faCirclePlus = faCirclePlus;

  toggleEditMode = output<void>();
  delete = output<void>();

  editDimension(index: number, element: DimensionType) {
    this.onEditDimension.emit({ index, element });
  }

  deleteDimension(i: number) {
    this.onDeleteDimension.emit({ index: i });
  }

  createDimension() {
    const dialogRef = this.dialog.open(DimensionDialogComponent, {
      minHeight: '320px',
      width: '800px',
      data: {
        title: 'Create Dimension',
        okButtonText: 'Save',
      },
    });

    dialogRef.afterClosed().subscribe((result: DimensionType) => {
      if (result) {
        this.onCreateDimension.emit({ schema: result });
      }
    });
  }
}
