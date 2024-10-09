import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { IonContent, IonIcon, IonImg, IonItem, IonLabel, IonMenu } from '@ionic/angular/standalone';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    IonContent,
    IonIcon,
    IonImg,
    IonItem,
    IonLabel,
    IonMenu,
  ],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  @ViewChild('menu') menu?: IonMenu;
  activeRoute?: string;


  constructor(
    private router: Router,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.activeRoute = event.url;
      }
    });
  }

  async navigate(route: string) {
    await this.menu?.close();
    this.router.navigate([route]);
  }

  get menuDisabled(): boolean {
    return this.activeRoute === '/login';
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    this.navigate('/login');
  }
}
