import { AfterViewInit, Component, inject } from '@angular/core';
import { AuthStore } from '@shared/store/auth.store';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { FeaturesMenuComponent } from '@app/feature/features-menu/features-menu.component';
import { FeatureStore } from '@app/shared/store/feature.store';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ConfigBarComponent } from '../../shared/components/config-bar/config-bar.component';

@Component({
  selector: 'aw-home',
  standalone: true,
  imports: [
    RouterLink,
    FeaturesMenuComponent,
    RouterOutlet,
    MatSidenavModule,
    ConfigBarComponent,
  ],
  templateUrl: './main-navigation.component.html',
  styleUrl: './main-navigation.component.scss',
})
export class MainNavigationComponent implements AfterViewInit {
  readonly authStore = inject(AuthStore);
  private router = inject(Router);
  readonly featureStore = inject(FeatureStore);

  ngAfterViewInit() {
    if (this.authStore.currentUser()) {
      this.featureStore.load();
    }
  }
}
