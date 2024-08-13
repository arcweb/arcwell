import { Component, Signal, inject } from '@angular/core';
import { NavigationEnd, Router, Event } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'aw-feature-sub-menu',
  standalone: true,
  imports: [],
  templateUrl: './feature-sub-menu.component.html',
  styleUrl: './feature-sub-menu.component.scss',
})
export class FeatureSubMenuComponent {
  private router = inject(Router);
  readonly currentRoute: Signal<string | undefined> = toSignal(
    this.router.events.pipe(
      filter(
        (event: Event): event is NavigationEnd =>
          event instanceof NavigationEnd,
      ),
      map((event: NavigationEnd) => event.url),
    ),
  );
  constructor() {}
}
