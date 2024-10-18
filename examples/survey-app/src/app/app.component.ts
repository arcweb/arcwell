import { Component, OnInit } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { SplashScreen } from '@capacitor/splash-screen';
import { MenuComponent } from '@components/menu/menu.component';
import { IonApp, IonRouterOutlet, Platform } from '@ionic/angular/standalone';
import { register } from 'swiper/element';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonApp, IonRouterOutlet, MenuComponent],
  providers: [],
})
export class AppComponent implements OnInit {
  constructor(
    private platform: Platform
  ) { }

  ngOnInit(): void {
    register();

    if (Capacitor.getPlatform() !== 'web') {
      ScreenOrientation.lock({ orientation: 'portrait' });
    }
  }

  ngAfterViewInit() {
    this.platform.ready().then(async () => {
      setTimeout(() => {
        SplashScreen.hide();
      }, 3000);
      // SplashScreen.hide();
    });
  }
}
