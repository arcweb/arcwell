import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { HealthService } from '@services/health.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
  providers: [HealthService],
})
export class AppComponent implements OnInit {
  constructor(private healthService: HealthService) {}

  ngOnInit(): void {
    this.healthService.checkHealth().subscribe({
      next: (healthCheck) => {
        console.log(healthCheck);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
}
