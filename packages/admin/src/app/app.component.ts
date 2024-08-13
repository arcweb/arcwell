import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './feature/header/header.component';
import { FooterComponent } from './feature/footer/footer.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { TopBarComponent } from './feature/top-menu/top-menu.component';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { FeaturesMenuComponent } from './feature/features-menu/features-menu.component';
import { FeatureSubMenuComponent } from './feature/feature-sub-menu/feature-sub-menu.component';

@Component({
  selector: 'aw-app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    ToastComponent,
    TopBarComponent,
    FeaturesMenuComponent,
    FeatureSubMenuComponent,
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
