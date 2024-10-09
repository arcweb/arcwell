import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonItem, IonLabel, IonSelect, IonSelectOption, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { HomeHeaderComponent } from '@components/home-header/home-header.component';
import { EChartsOption } from 'echarts';
import { FactTypeService } from '@services/fact-type.service';
import { ToastService } from '@services/toast.service';
import { FactService } from '@services/fact.service';
import { AuthService } from '@services/auth.service';
import { switchMap } from 'rxjs';
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
    private authService: AuthService,
    private chartService: ChartService,
    private factService: FactService,
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
        this.factTypes = response.data;
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
    this.selectFactTypeResults(event.detail.value);
    this.selectedSurveyType = event.detail.value;
  }

  selectFactTypeResults(factType: FactType) {
    const config = this.chartService.getChartConfig(factType.key);

    if (!config) {
      this.toastService.presentToast('bottom', 'Survey type not supported', 3000, 'error');
      return;
    }

    this.authService.currentUser().pipe(
      switchMap((response: any) => {
        return this.factService.queryFacts({
          filters: [
            {
              key: 'type_key',
              value: factType.key,
            },
            {
              key: 'person_id',
              value: response.data.personId,
            },
          ],
        });
      })
    ).subscribe({
      next: (response) => {
        const chartOptions = this.chartService.getChartOption(factType, response.data, config);
        this.chartOptions = chartOptions;
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
