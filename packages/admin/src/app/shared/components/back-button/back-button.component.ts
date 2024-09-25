import { Component, Input, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { BackService } from '@app/shared/services/back.service';

@Component({
  selector: 'aw-back-button',
  standalone: true,
  imports: [MatButton, MatIcon],
  providers: [BackService],
  templateUrl: './back-button.component.html',
  styleUrl: './back-button.component.scss',
})
export class BackButtonComponent {
  // URL is used to override the default back button behavior
  @Input() url = '';
  readonly backService = inject(BackService);
}
