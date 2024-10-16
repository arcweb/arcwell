import { AfterViewInit, Component, Type, inject, signal } from '@angular/core';
import { AuthStore } from '@shared/store/auth.store';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { FeaturesMenuComponent } from '@app/feature/features-menu/features-menu.component';

import { FeatureStore } from '@app/shared/store/feature.store';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ConfigBarComponent } from '@shared/components/config-bar/config-bar.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import {
  DetailComponent,
  DetailComponentType,
} from '@feature/project-management/detail/detail.component';
import { DetailStore } from '@feature/project-management/detail/detail.store';

@Component({
  selector: 'aw-home',
  standalone: true,
  imports: [
    RouterLink,
    FeaturesMenuComponent,
    RouterOutlet,
    MatSidenavModule,
    ConfigBarComponent,
    DetailComponent,
    FontAwesomeModule,
    DetailComponent,
    MatButtonModule,
  ],
  providers: [DetailStore],
  templateUrl: './main-navigation.component.html',
  styleUrl: './main-navigation.component.scss',
})
export class MainNavigationComponent implements AfterViewInit {
  readonly authStore = inject(AuthStore);
  private router = inject(Router);
  public detailStore = inject(DetailStore);
  private activatedRoute = inject(ActivatedRoute);
  readonly featureStore = inject(FeatureStore);
  readonly navigation = this.router.events.pipe(
    takeUntilDestroyed(),
    filter(event => event instanceof NavigationEnd),
  );
  faTimes = faTimes;
  detailId = signal<string>('');
  detailComponent = signal<Type<DetailComponentType> | null>(null);
  typeKey = signal<string | undefined>(undefined);

  constructor() {
    this.navigation.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // get the detail_id queryparam from the url
        const { detail_id } = this.activatedRoute.snapshot.queryParams;
        this.detailId.update(() => detail_id || '');

        // get the type_key from childs url params
        const urlParams = this.activatedRoute.firstChild?.snapshot?.params;
        this.typeKey.set(urlParams ? urlParams['type_key'] : undefined);

        // get the detailComponent from the route data
        // TODO: look into refactoring routing so that the detailComponent is not nested so deeply
        // when getting it from the user-managment
        const detailComponent =
          this.activatedRoute.snapshot.firstChild?.data['detailComponent'] ||
          this.activatedRoute.snapshot.firstChild?.firstChild?.firstChild?.data[
            'detailComponent'
          ];

        this.detailComponent.update(() => detailComponent || null);

        // set the drawerOpen based on the presence of the detail_id queryparam
        this.detailStore.setDrawerOpen(
          !!this.activatedRoute.snapshot.queryParams['detail_id'],
        );
      }
    });
  }

  ngAfterViewInit() {
    if (this.authStore.currentUser()) {
      this.featureStore.load();
    }
  }

  closeDetail() {
    // remove the detail_id queryparam causing the detail sidenav to close
    this.detailStore.clearDetailId();
  }
}
