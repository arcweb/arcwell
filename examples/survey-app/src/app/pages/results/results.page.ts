import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { HomeHeaderComponent } from '@components/home-header/home-header.component';
import { EChartsOption } from 'echarts';
import { NgxEchartsDirective, provideEcharts } from 'ngx-echarts';
import { FactType, FactTypeService } from '@services/fact-type/fact-type.service';
import { ToastService } from '@services/toast/toast.service';
import { Fact, FactService } from '@services/fact/fact.service';
import { AuthService } from '@services/auth/auth.service';
import { switchMap } from 'rxjs';
import { SurveyConfig, surveyConfigs } from './configs';

@Component({
  selector: 'app-results',
  templateUrl: './results.page.html',
  styleUrls: ['./results.page.scss'],
  standalone: true,
  imports: [IonContent, IonButton, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, HomeHeaderComponent, NgxEchartsDirective],
  providers: [provideEcharts()],
})
export class ResultsPage implements OnInit {
  loading = false;
  factTypes: FactType[] = [];

  chartOption: EChartsOption = {};

  constructor(
    private authService: AuthService,
    private factService: FactService,
    private factTypeService: FactTypeService,
    private toastService: ToastService,
  ) { }


  ngOnInit() {
    this.loadFactTypes();
  }

  getChartOption(factType: FactType, facts: Fact[], config: SurveyConfig): EChartsOption {
    const dates = facts
      .sort((a: any, b: any) => new Date(a[config.dateKey]).getTime() - new Date(b[config.dateKey]).getTime())
      .map((fact: any) => new Date(fact[config.dateKey]).toLocaleDateString());

    let series: any[] = [];

    // Handle OKS left and right knees
    if (factType.key === 'survey_oks' && config.scoreKeys) {
      const leftScores = facts.map((fact: any) => fact[config.scoreKeys!.left] ?? 0);
      const rightScores = facts.map((fact: any) => fact[config.scoreKeys!.right] ?? 0);

      series = [
        {
          name: 'Left Knee',
          data: leftScores,
          type: config.chartType,
          smooth: true,
          lineStyle: {
            width: 2,
            color: '#007bff',
          },
          itemStyle: {
            color: '#007bff',
          },
          symbolSize: 8,
          areaStyle: {},
        },
        {
          name: 'Right Knee',
          data: rightScores,
          type: config.chartType,
          smooth: true,
          lineStyle: {
            width: 2,
            color: '#ff6347',
          },
          itemStyle: {
            color: '#ff6347',
          },
          symbolSize: 8,
          areaStyle: {},
        }
      ];
    } else if (config.scoreKey) {
      // Handle single-score surveys like PHQ-9 or GAD-7
      const scores = facts.map((fact: any) => fact[config.scoreKey!] ?? 0);

      series = [
        {
          data: scores,
          type: config.chartType,
          smooth: true,
          markLine: {
            data: config.assessmentRanges.map((range) => ({
              yAxis: range.value,
              label: {
                formatter: range.label,
                position: 'insideEnd',
              },
              lineStyle: {
                color: '#ff6347',
                type: 'dashed',
              },
            })),
          },
        },
      ];
    }

    return {
      title: {
        text: `${factType.name} Results`,
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const tooltipText = params.map((param: any) => `${param.seriesName}: ${param.data}`).join('<br/>');
          return `${params[0].axisValue}<br/>${tooltipText}`;
        }, // Shows date and both scores (left and right) on hover
      },
      xAxis: {
        type: 'category',
        data: dates,
        name: 'Date',
        boundaryGap: false,
        axisLabel: {
          rotate: 45, // Rotate dates
        },
      },
      yAxis: {
        type: 'value',
        name: config.yAxisLabel,
        max: config.maxScore,
      },
      series,
    };
  }

  getSurveyConfig(surveyType: string): SurveyConfig | null {
    return surveyConfigs[surveyType] || null;
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

  selectFactTypeResults(factType: FactType) {
    const config = this.getSurveyConfig(factType.key);
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
        console.log('response', response.data);
        const chartOption = this.getChartOption(factType, response.data, config);
        this.chartOption = chartOption;
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
