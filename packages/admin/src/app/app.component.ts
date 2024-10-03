import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthStore } from './shared/store/auth.store';
import { ToastComponent } from './shared/components/toast/toast.component';
import { ConfigStore } from './shared/store/config.store';

@Component({
  selector: 'aw-app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'Arcwell';
  private matIconRegistry = inject(MatIconRegistry);
  private domSanitizer = inject(DomSanitizer);
  readonly authStore = inject(AuthStore);
  readonly configStore = inject(ConfigStore);

  constructor() {
    this.matIconRegistry.addSvgIcon(
      'arcwell-logo-white',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        'assets/arcwell-logo-white.svg',
      ),
    );

    this.matIconRegistry.addSvgIcon(
      'arcwell-logo-blue',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        'assets/arcwell-logo-blue.svg',
      ),
    );

    this.configStore.load().then(() => {
      console.log('config', this.configStore.config());
    });

    if (!this.authStore.currentUser() && this.authStore.token()) {
      this.authStore.loadCurrentUser();
    }
  }
}
