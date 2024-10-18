import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonItem, IonLabel, IonSelect, IonSelectOption, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { HomeHeaderComponent } from '@components/home-header/home-header.component';
import { EChartsOption } from 'echarts';
import { FactTypeService } from '@services/fact-type.service';
import { ToastService } from '@services/toast.service';
import { Router } from '@angular/router';
import { FactType } from '@models/fact-type';
import { ChartService } from '@services/chart.service';
import { ChartComponent } from '@components/chart/chart.component';

@Component({
  selector: 'app-results',
  templateUrl: './results.page.html',
  styleUrls: ['./results.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ChartComponent,
    FormsModule,
    HomeHeaderComponent,
    IonButton,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToolbar,
  ],
})
export class ResultsPage implements OnInit {
  loading = false;
  factTypes: FactType[] = [];
  selectedSurveyType?: FactType;

  chartOptions: EChartsOption = {};

  constructor(
    private chartService: ChartService,
    private factTypeService: FactTypeService,
    private router: Router,
    private toastService: ToastService,
  ) { }

  ngOnInit() {
    this.loadFactTypes();
  }

  headerMainAction() {
    this.router.navigate(['/surveys']);
  }

  loadFactTypes(): void {
    this.loading = true;
    this.factTypeService.getFactTypes().subscribe({
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

  onSurveyChange(event: any) {
    this.chartService.getChartOption(event.detail.value).subscribe({
      next: (chartOptions) => {
        this.chartOptions = chartOptions;
        this.selectedSurveyType = event.detail.value;
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
    });
  }
}
