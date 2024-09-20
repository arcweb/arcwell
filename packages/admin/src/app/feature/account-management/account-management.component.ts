import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { EmailService } from '@app/shared/services/email.service';
import { AuthStore } from '@app/shared/store/auth.store';

@Component({
  selector: 'aw-account-management',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  templateUrl: './account-management.component.html',
  styleUrl: './account-management.component.scss',
})
export class AccountManagementComponent {
  readonly authStore = inject(AuthStore);
  private emailService: EmailService = inject(EmailService);
  userAvatar = '';

  sendEmail() {
    this.emailService.sendEmail(this.authStore.currentUser()!.email);
  }
}
