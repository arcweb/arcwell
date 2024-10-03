import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonButtons, IonHeader, IonIcon, IonImg, IonMenuToggle, IonTitle, IonToolbar, Platform } from '@ionic/angular/standalone';

@Component({
  selector: 'app-home-header',
  standalone: true,
  imports: [
    IonButton,
    IonButtons,
    IonHeader,
    IonIcon,
    IonImg,
    IonMenuToggle,
    IonTitle,
    IonToolbar,
  ],
  templateUrl: './home-header.component.html',
  styleUrls: ['./home-header.component.scss'],
})
export class HomeHeaderComponent {

  constructor(
    public platform: Platform,
    private router: Router,
  ) { }

  navigateSurveys(): void {
    this.router.navigate(['/surveys']);
  }
}
