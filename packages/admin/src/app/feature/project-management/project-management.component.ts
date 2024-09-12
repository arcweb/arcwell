import { AfterViewInit, Component, effect, inject } from '@angular/core';
import { AuthStore } from '@shared/store/auth.store';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { FeatureSubMenuComponent } from '@feature/project-management/feature-sub-menu/feature-sub-menu.component';
import { FeaturesMenuComponent } from '@feature/project-management/features-menu/features-menu.component';
import { TopMenuComponent } from '@feature/top-menu/top-menu.component';
import { P } from '@angular/cdk/keycodes';
import { FeatureStore } from '@app/shared/store/feature.store';

@Component({
  selector: 'aw-home',
  standalone: true,
  imports: [
    RouterLink,
    FeatureSubMenuComponent,
    FeaturesMenuComponent,
    RouterOutlet,
    TopMenuComponent,
  ],
  templateUrl: './project-management.component.html',
  styleUrl: './project-management.component.scss',
})
export class ProjectManagementComponent implements AfterViewInit {
  readonly authStore = inject(AuthStore);
  private router = inject(Router);
  readonly featureStore = inject(FeatureStore);

  constructor() {
    effect(() => {
      if (!this.authStore.currentUser()) {
        this.router.navigate(['auth', 'login']);
      }
    });
  }

  ngAfterViewInit() {
    if (this.authStore.currentUser()) {
      this.featureStore.load();
    }
  }
}
