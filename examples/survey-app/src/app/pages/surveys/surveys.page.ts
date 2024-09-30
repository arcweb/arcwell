import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonItem, IonLabel, IonList, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { FactType, FactTypeService } from '@services/fact-type/fact-type.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-surveys',
  templateUrl: './surveys.page.html',
  styleUrls: ['./surveys.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonLabel,
    IonItem,
    IonList,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule
  ]
})
export class SurveysPage {
  factTypes: FactType[] = [];

  constructor(
    private factTypeService: FactTypeService,
    private router: Router,
  ) {
    this.loadFactTypes({});
  }

  loadFactTypes(queryData: any): void {
    this.factTypeService.getFactTypes(queryData).subscribe({
      next: (response) => {
        this.factTypes = response.data;
        console.log('Fact types:', this.factTypes);
      },
      error: (error) => {
        console.error('Error fetching fact types:', error);
      },
    });
  }

  navigateSurvey(id: string): void {
    this.router.navigate(['/survey', id]);
  }
}
