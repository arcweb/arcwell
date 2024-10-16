import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import { ToastMessage } from '../../models';
import { ToastService } from '../../services/toast.service';
import { NgClass } from '@angular/common';
import { ClickDirective } from '@app/shared/directives/click.directive';

@Component({
  selector: 'aw-toast',
  standalone: true,
  imports: [NgClass, ClickDirective, MatButtonModule, FontAwesomeModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
})
export class ToastComponent {
  private toastService: ToastService = inject(ToastService);
  faTimes = faTimes;
  messages: ToastMessage[] = this.toastService.getMessages();

  deleteMsg(timeStamp: number) {
    this.toastService.removeMessage(timeStamp);
  }
}
