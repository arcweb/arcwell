import { Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'aw-no-records-generic',
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: './no-records-generic.component.html',
  styleUrl: './no-records-generic.component.scss',
})
export class NoRecordsGenericComponent {
  message = input<string>();
}
