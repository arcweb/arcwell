import { AfterViewInit, Component, inject } from '@angular/core';
import { AuthStore } from '@shared/store/auth.store';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { FeaturesMenuComponent } from '@feature/project-management/features-menu/features-menu.component';
import { FeatureStore } from '@app/shared/store/feature.store';
import { MatSidenavModule } from '@angular/material/sidenav';

@Component({
  selector: 'aw-home',
  standalone: true,
  imports: [RouterLink, FeaturesMenuComponent, RouterOutlet, MatSidenavModule],
  templateUrl: './project-management.component.html',
  styleUrl: './project-management.component.scss',
})
export class ProjectManagementComponent implements AfterViewInit {
  readonly authStore = inject(AuthStore);
  private router = inject(Router);
  readonly featureStore = inject(FeatureStore);

  ngAfterViewInit() {
    if (this.authStore.currentUser()) {
      this.featureStore.load();
    }
  }
}
