import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { FeatureStore } from '@shared/store/feature.store';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { AuthStore } from '@app/shared/store/auth.store';
import { ConfirmationDialogComponent } from '@app/shared/components/dialogs/confirmation/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { SubfeatureModel } from '@app/shared/models/subfeature.model';

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
  readonly dialog = inject(MatDialog);
  readonly featureStore = inject(FeatureStore);
  private router = inject(Router);
  public authStore = inject(AuthStore);
  readonly navigation = this.router.events.pipe(
    takeUntilDestroyed(),
    filter(event => event instanceof NavigationEnd),
  );
  currentUserId = this.authStore.currentUser()?.id;

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

  // edge cases for settings menu
  onSettingsClick(subFeature: SubfeatureModel) {
    if (subFeature.name.toLowerCase() === 'profile') {
      this.viewAccount();
    } else if (subFeature.name.toLowerCase() === 'log out') {
      this.logout();
    }
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
          this.router.navigate(['']);
        });
      }
    });
  }

  viewAccount() {
    this.router.navigate([
      'project-management',
      'settings',
      'user-management',
      'all-users',
      this.authStore.currentUser()?.id,
    ]);
  }
}
