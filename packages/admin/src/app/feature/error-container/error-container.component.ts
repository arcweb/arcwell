import { Component, input } from '@angular/core';
import { ErrorResponseType } from '@schemas/error.schema';

@Component({
  selector: 'aw-error-container',
  standalone: true,
  imports: [],
  templateUrl: './error-container.component.html',
  styleUrl: './error-container.component.scss',
})
export class ErrorContainerComponent {
  errors = input.required<ErrorResponseType[]>();
}
