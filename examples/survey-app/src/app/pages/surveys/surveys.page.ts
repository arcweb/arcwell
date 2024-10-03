import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonItem, IonLabel, IonList, IonSpinner, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { FactType, FactTypeService } from '@services/fact-type/fact-type.service';
import { Router } from '@angular/router';
import { HomeHeaderComponent } from '@components/home-header/home-header.component';

@Component({
  selector: 'app-surveys',
  templateUrl: './surveys.page.html',
  styleUrls: ['./surveys.page.scss'],
  standalone: true,
  imports: [
    HomeHeaderComponent,
    IonContent,
    IonHeader,
    IonLabel,
    IonItem,
    IonList,
    IonSpinner,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule
  ]
})
export class SurveysPage {
  factTypes: FactType[] = [];

  loading = false;

  constructor(
    private factTypeService: FactTypeService,
    private router: Router,
  ) {
    this.loadFactTypes({});
  }

  loadFactTypes(queryData: any): void {
    this.loading = true;
    this.factTypeService.getFactTypes(queryData).subscribe({
      next: (response) => {
        this.factTypes = response.data;
        console.log('Fact types:', this.factTypes);
      },
      error: (error) => {
        console.error('Error fetching fact types:', error);
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  navigateSurvey(id: string): void {
    this.router.navigate(['/survey', id]);
  }
}
