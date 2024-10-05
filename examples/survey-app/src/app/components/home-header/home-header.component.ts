import { Component, EventEmitter, Output } from '@angular/core';
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
  @Output() mainAction: EventEmitter<void> = new EventEmitter<void>();

  constructor(
    public platform: Platform,
  ) { }

  navigateSurveys(): void {
    if (this.mainAction) {
      this.mainAction.emit();
    }
  }
}
