import { Injectable } from '@angular/core';
import { ChartConfig, chartConfigs } from '@configs/chart-configs';
import { Fact } from '@models/fact';
import { FactType } from '@models/fact-type';
import { EChartsOption } from 'echarts';
import { ToastService } from './toast.service';
import { AuthService } from './auth.service';
import { map, Observable, switchMap } from 'rxjs';
import { FactService } from './fact.service';

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  constructor(
    private authService: AuthService,
    private factService: FactService,
    private toastService: ToastService,
  ) { }

  createChartOptions(factType: FactType, facts: Fact[], config: ChartConfig): EChartsOption {
    const dates = facts
      .sort((a: any, b: any) => new Date(a[config.dateKey]).getTime() - new Date(b[config.dateKey]).getTime())
      .map((fact: any) => new Date(fact[config.dateKey]).toLocaleDateString());

    let series: any[] = [];

    if (factType.key === 'survey_oks') {
      const leftIncluded = facts.some((fact: any) => fact[config.scoreKeys!.left]);
      const rightIncluded = facts.some((fact: any) => fact[config.scoreKeys!.right]);

      if (leftIncluded) {
        const leftScores = leftIncluded ? facts.map((fact: any) => fact[config.scoreKeys!.left]) : null;
        series.push({
          name: 'Left Knee',
          data: leftScores,
          type: config.chartType,
          smooth: false,
          lineStyle: {
            width: 2,
            color: '#007bff',
          },
          itemStyle: {
            color: '#007bff',
          },
          symbolSize: 8,
        });
      }

      if (rightIncluded) {
        const rightScores = rightIncluded ? facts.map((fact: any) => fact[config.scoreKeys!.right]) : null;
        series.push({
          name: 'Right Knee',
          data: rightScores,
          type: config.chartType,
          smooth: false,
          lineStyle: {
            width: 2,
            color: '#ff6347',
          },
          itemStyle: {
            color: '#ff6347',
          },
          symbolSize: 8,
        });
      }
    } else if (config.scoreKey) {
      const scores = facts.map((fact: any) => fact[config.scoreKey!] ?? 0);
      series = [
        {
          data: scores,
          type: config.chartType,
          smooth: false,
        },
      ];
    }

    return {
      title: {
        text: `Your previous ${factType.name} results`,
        left: 'center',
      },
      legend: factType.key === 'survey_oks' ? {
        data: series.map((s) => s.name),
        bottom: '0%',
        left: 'center',
      } : undefined,
      xAxis: {
        type: 'category',
        data: dates,
        name: 'Date',
        boundaryGap: false,
        axisLabel: {
          rotate: 45,
          interval: 0,
        },
        axisTick: {
          alignWithLabel: true,
        }
      },
      grid: {
        left: '10%',
        right: '15%',
        top: '15%',
        bottom: '15%',
        containLabel: true,
      },
      yAxis: {
        type: 'value',
        name: config.yAxisLabel,
        max: config.maxScore,
      },
      series,
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: 0,
          startValue: 0,
          endValue: 3,
          zoomLock: true,
        }
      ],
    };
  }

  getChartConfig(surveyType: string): ChartConfig | null {
    return chartConfigs[surveyType] || null;
  }

  getChartOption(factType: FactType): Observable<EChartsOption> {
    const config = this.getChartConfig(factType.key);

    if (!config) {
      this.toastService.presentToast('bottom', 'Survey type not supported', 3000, 'error');
      return new Observable(observer => observer.next({} as EChartsOption));
    }

    return this.selectFactTypeResults(factType).pipe(
      map((facts: Fact[]) => this.createChartOptions(factType, facts, config))
    );
  }

  selectFactTypeResults(factType: FactType): Observable<Fact[]> {
    return this.authService.currentUser().pipe(
      switchMap((response: any) => {
        return this.factService.queryFacts({
          filters: [
            { key: 'type_key', value: factType.key },
            { key: 'person_id', value: response.data.personId },
          ],
        });
      }),
      map((response) => response.data),
    );
  }
}
