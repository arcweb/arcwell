import { Component, OnInit } from '@angular/core';
import { MenuComponent } from '@components/menu/menu.component';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
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
  constructor() { }

  ngOnInit(): void {
    register();
  }
}
