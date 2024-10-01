import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { FeatureStore } from '@shared/store/feature.store';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'aw-features-menu',
  standalone: true,
  imports: [
    MatExpansionModule,
    MatIconModule,
    RouterModule,
    NgClass,
    MatDividerModule,
  ],
  templateUrl: './features-menu.component.html',
  styleUrl: './features-menu.component.scss',
})
export class FeaturesMenuComponent {
  readonly featureStore = inject(FeatureStore);
  private router = inject(Router);
  readonly navigation = this.router.events.pipe(
    takeUntilDestroyed(),
    filter(event => event instanceof NavigationEnd),
  );

  constructor() {
    this.navigation.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const urlAfterRedirects = event.urlAfterRedirects;
        const features = this.featureStore.features();
        this.featureStore.setActiveFeatureAndSubfeatureByRoute(
          urlAfterRedirects,
          features,
          true,
        );
      }
    });
  }
}
