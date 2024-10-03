import { Component, OnInit } from '@angular/core';
import { MenuComponent } from '@components/menu/menu.component';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { HealthService } from '@services/health/health.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonApp, IonRouterOutlet, MenuComponent],
  providers: [HealthService],
})
export class AppComponent implements OnInit {
  constructor(private healthService: HealthService) { }

  ngOnInit(): void {
  }
}
