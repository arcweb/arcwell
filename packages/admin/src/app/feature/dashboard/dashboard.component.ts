import { Component, Signal, effect, inject } from '@angular/core';
import { AuthStore } from '@shared/store/auth.store';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { FeatureSubMenuComponent } from '@feature/feature-sub-menu/feature-sub-menu.component';
import { FeaturesMenuComponent } from '@feature/features-menu/features-menu.component';
import { TopBarComponent } from '@feature/top-menu/top-menu.component';

@Component({
  selector: 'aw-home',
  standalone: true,
  imports: [
    RouterLink,
    FeatureSubMenuComponent,
    FeaturesMenuComponent,
    RouterOutlet,
    TopBarComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
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
