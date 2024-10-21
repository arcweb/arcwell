import { Component, effect, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthStore } from '@app/shared/store/auth.store';

@Component({
  selector: 'aw-users',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent {
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
