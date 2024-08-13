import { Component, Signal, inject } from '@angular/core';
import { NavigationEnd, RouterModule, Event, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FeatureModel } from '@app/shared/models/feature.model';
import { FeatureService } from '@app/shared/services/feature.service';
import { filter, map } from 'rxjs';
import { NgClass } from '@angular/common';

@Component({
  selector: 'aw-features-menu',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, RouterModule, NgClass],
  templateUrl: './features-menu.component.html',
  styleUrl: './features-menu.component.scss',
})
export class FeaturesMenuComponent {
  private router = inject(Router);
  private featureService = inject(FeatureService);
  readonly features: Signal<FeatureModel[] | undefined> = toSignal(
    this.featureService.getFeatures(),
  );
  readonly currentRoute: Signal<string | undefined> = toSignal(
    this.router.events.pipe(
      filter(
        (event: Event): event is NavigationEnd =>
          event instanceof NavigationEnd,
      ),
      map((event: NavigationEnd) => event.url),
    ),
  );

  navigate(path: string) {
    console.log('Navigating to:', path);

    this.router.navigate([`/${path}`]);
  }
}
