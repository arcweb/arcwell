import { Component, effect, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthStore } from '@app/shared/store/auth.store';

@Component({
  selector: 'aw-user-management',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss',
})
export class UserManagementComponent {
  readonly authStore = inject(AuthStore);
  private router = inject(Router);

  constructor() {
    effect(() => {
      if (!this.authStore.currentUser()) {
        this.router.navigate(['auth', 'login']);
      }
    });
  }
}
