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
import { DimensionSchemaType } from '@schemas/dimension-schema.schema';
import { MatTableModule } from '@angular/material/table';
import { MatCheckbox } from '@angular/material/checkbox';
import { DimensionSchemaDialogComponent } from '@shared/components/dialogs/dimension-schema/dimension-schema-dialog.component';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'aw-dimension-schemas',
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
  templateUrl: './dimension-schemas.component.html',
  styleUrl: './dimension-schemas.component.scss',
})
export class DimensionSchemasComponent {
  readonly dialog = inject(MatDialog);

  inEditMode = input.required<boolean>();
  dimensionSchemasCopy = input.required<DimensionSchemaType[]>();

  onEditDimensionSchema = output<{
    index: number;
    element: DimensionSchemaType;
  }>();
  onDeleteDimensionSchema = output<{ index: number }>();
  onCreateDimensionSchema = output<{ schema: DimensionSchemaType }>();

  displayedColumns: string[] = [
    'name',
    'key',
    'dataType',
    'dataUnit',
    'isRequired',
    'actions',
  ];

  protected readonly faPenToSquare = faPenToSquare;
  protected readonly faTrashCan = faTrashCan;
  protected readonly faCirclePlus = faCirclePlus;

  toggleEditMode = output<void>();
  delete = output<void>();

  editDimensionSchema(index: number, element: DimensionSchemaType) {
    this.onEditDimensionSchema.emit({ index, element });
  }

  deleteDimensionSchema(i: number) {
    this.onDeleteDimensionSchema.emit({ index: i });
  }

  createDimensionSchema() {
    const dialogRef = this.dialog.open(DimensionSchemaDialogComponent, {
      minHeight: '520px',
      width: '800px',
      data: {
        title: 'Create Dimension Schema',
        okButtonText: 'Save',
      },
    });

    dialogRef.afterClosed().subscribe((result: DimensionSchemaType) => {
      if (result) {
        this.onCreateDimensionSchema.emit({ schema: result });
      }
    });
  }
}
