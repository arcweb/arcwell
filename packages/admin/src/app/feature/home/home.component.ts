import { Component, effect, inject } from '@angular/core';
import { AuthStore } from '@shared/store/auth.store';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { ToastComponent } from '@app/shared/components/toast/toast.component';
import { TopMenuComponent } from '../top-menu/top-menu.component';

@Component({
  selector: 'aw-home',
  standalone: true,
  imports: [RouterLink, RouterOutlet, ToastComponent, TopMenuComponent],
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
