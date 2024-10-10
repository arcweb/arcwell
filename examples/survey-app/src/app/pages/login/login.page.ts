import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonImg, IonInput, IonItem, IonTitle, IonToolbar, Platform } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonInput,
    IonItem,
    IonImg,
    IonTitle,
    IonToolbar,
    IonHeader,
    IonButton,
  ],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    public platform: Platform,
  ) { }

  ngOnInit() {
  }


  getPlatformClass(): string {
    return Capacitor.getPlatform();
  }

  async login() {
    try {
      await this.authService.login(this.email, this.password);
      this.email = '';
      this.password = '';
      this.errorMessage = '';
      this.router.navigate(['/surveys']);
    } catch (error) {
      this.errorMessage = 'Invalid login credentials';
    }
  }
}
