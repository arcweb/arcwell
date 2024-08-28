import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';
import { ClickDirective } from '@app/shared/directives/click.directive';
import { MatIconModule } from '@angular/material/icon';

import { BrandService } from '@app/shared/services/brand.service';
import { AuthStore } from '@app/shared/store/auth.store';
import { FeatureStore } from '@shared/store/feature.store';

interface TopMenuNavLink {
  name: string;
  path: string;
  featurePath?: string;
}

@Component({
  selector: 'aw-top-menu',
  standalone: true,
  imports: [MatToolbarModule, ClickDirective, MatIconModule, RouterModule],
  templateUrl: './top-menu.component.html',
  styleUrl: './top-menu.component.scss',
})
export class TopMenuComponent {
  private brandService: BrandService = inject(BrandService);
  public authStore = inject(AuthStore);
  public featureStore = inject(FeatureStore);

  instanceName = this.brandService.getInstanceName(4);

  userAvatar = '';
  navLinks: TopMenuNavLink[] = [
    {
      name: 'Project',
      path: '/project-management',
      featurePath: 'people',
    },
    {
      name: 'Users',
      path: '/user-management/all-users',
    },
    { name: 'Settings', path: '/server-settings' },
  ];
}
