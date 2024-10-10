import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private toastController: ToastController) { }

  async presentToast(
    position: 'top' | 'middle' | 'bottom',
    message: string,
    duration = 1500,
    cssClass = '',
  ) {
    const toast = await this.toastController.create({
      message,
      duration,
      position,
      cssClass,
    });

    await toast.present();
  }
}
