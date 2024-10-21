import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonItem, IonLabel, IonList, IonSpinner, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { FactTypeService } from '@services/fact-type.service';
import { HomeHeaderComponent } from '@components/home-header/home-header.component';
import { ToastService } from '@services/toast.service';
import { GenericSurveyComponent } from '@components/generic-survey/generic-survey.component';
import { OksSurveyComponent } from '@components/oks-survey/oks-survey.component';
import { FactType } from '@models/fact-type';
import { surveyConfigs } from '@configs/survey-configs';

@Component({
  selector: 'app-surveys',
  templateUrl: './surveys.page.html',
  styleUrls: ['./surveys.page.scss'],
  standalone: true,
  imports: [
    GenericSurveyComponent,
    OksSurveyComponent,
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
  selectedFactType?: FactType;

  loading = false;

  constructor(
    private factTypeService: FactTypeService,
    private toastService: ToastService,
  ) {
    this.loadFactTypes({});
  }

  loadFactTypes(queryData: any): void {
    this.loading = true;
    this.factTypeService.getFactTypes(queryData).subscribe({
      next: (response) => {
        const surveyFactTypes = response.data.filter((factType) => factType.tags.some((tag) => tag === 'survey'));
        this.factTypes = surveyFactTypes;
      },
      error: (error) => {
        this.toastService.presentToast(
          'bottom',
          'Error fetching fact types',
          3000,
          'error'
        );
        console.error('Error fetching fact types:', error);
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  getSurveyConfig(): any {
    if (!this.selectedFactType) return null
    return surveyConfigs[this.selectedFactType.key];
  }

  resetSurveys(): void {
    this.selectedFactType = undefined;
  }
}
