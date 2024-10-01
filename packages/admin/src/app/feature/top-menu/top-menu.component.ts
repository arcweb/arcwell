import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';
import { ClickDirective } from '@app/shared/directives/click.directive';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { BrandService } from '@app/shared/services/brand.service';
import { AuthStore } from '@app/shared/store/auth.store';
import { FeatureStore } from '@shared/store/feature.store';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@app/shared/components/dialogs/confirmation/confirmation-dialog.component';
import { MatButtonModule } from '@angular/material/button';

interface TopMenuNavLink {
  name: string;
  path: string;
  featurePath?: string;
}

@Component({
  selector: 'aw-top-menu',
  standalone: true,
  imports: [
    MatToolbarModule,
    ClickDirective,
    MatIconModule,
    RouterModule,
    MatMenuModule,
    MatButtonModule,
  ],
  templateUrl: './top-menu.component.html',
  styleUrl: './top-menu.component.scss',
})
export class TopMenuComponent {
  readonly dialog = inject(MatDialog);
  private brandService: BrandService = inject(BrandService);
  public authStore = inject(AuthStore);
  public featureStore = inject(FeatureStore);
  private router = inject(Router);

  instanceName = this.brandService.getInstanceName(4);
  currentUserId = this.authStore.currentUser()?.id;

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

  viewAccount() {
    this.router.navigate([
      'user-management',
      'all-users',
      this.authStore.currentUser()?.id,
    ]);
  }

  logout() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Confirm Log Out',
        question: 'Are you sure you want to logout?',
        okButtonText: 'Log Out',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.authStore.logout().then(() => {
          this.router.navigate(['/login']);
        });
      }
    });
  }
}
