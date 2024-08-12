import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './feature/header/header.component';
import { FooterComponent } from './feature/footer/footer.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { TopBarComponent } from './feature/top-menu/top-menu.component';

@Component({
  selector: 'aw-app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    ToastComponent,
    TopBarComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'Arcwell';
}
