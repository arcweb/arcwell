import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/components/toast/toast.component';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { FeaturesMenuComponent } from '@feature/project-management/features-menu/features-menu.component';
import { FeatureSubMenuComponent } from '@feature/project-management/feature-sub-menu/feature-sub-menu.component';
import { TopMenuComponent } from './feature/top-menu/top-menu.component';

@Component({
  selector: 'aw-app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    ToastComponent,
    FeaturesMenuComponent,
    FeatureSubMenuComponent,
    TopMenuComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'Arcwell';
  private matIconRegistry = inject(MatIconRegistry);
  private domSanitizer = inject(DomSanitizer);

  constructor() {
    this.matIconRegistry.addSvgIcon(
      'arcwell-logo',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        'assets/arcwell-logo.svg',
      ),
    );
  }
}
