import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
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
  userAvatar = '';
}
