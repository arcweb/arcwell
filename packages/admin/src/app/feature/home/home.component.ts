import { Component, effect, inject } from '@angular/core';
import { AuthStore } from '@shared/store/auth.store';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'aw-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  readonly authStore = inject(AuthStore);
  private router = inject(Router);

  constructor() {
    effect(() => {
      if (this.authStore.currentUser()) {
        this.router.navigate(['project-management']);
      }
    });
  }
}
