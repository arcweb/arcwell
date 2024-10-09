import { Injectable } from '@angular/core';
import { ChartConfig, chartConfigs } from '@configs/chart-configs';
import { Fact } from '@models/fact';
import { FactType } from '@models/fact-type';
import { EChartsOption } from 'echarts';

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  constructor() { }

  getChartConfig(surveyType: string): ChartConfig | null {
    return chartConfigs[surveyType] || null;
  }

  getChartOption(factType: FactType, facts: Fact[], config: ChartConfig): EChartsOption {
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
      // Handle single-score surveys like PHQ-9 or GAD-7
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
        text: `${factType.name} Results`,
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
        left: '10%',  // Padding from the left side
        right: '15%', // Padding from the right side
        top: '15%',   // Padding from the top
        bottom: '15%', // Padding from the bottom, to accommodate rotated labels
        containLabel: true, // Ensure the labels stay within the chart
      },
      yAxis: {
        type: 'value',
        name: config.yAxisLabel,
        max: config.maxScore,
      },
      series,
      dataZoom: [
        {
          type: 'inside',  // Enable horizontal scrolling inside the chart
          xAxisIndex: 0,   // Apply to the x-axis
          startValue: 0,   // Start with the first data point
          endValue: 3,     // End showing the fourth data point
          zoomLock: true,  // Lock zoom to prevent zooming, only allow scrolling
        }
      ],
    };
  }
}
