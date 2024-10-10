import { Component, Input, OnInit } from '@angular/core';
import { EChartsOption } from 'echarts';
import { NgxEchartsDirective, provideEcharts } from 'ngx-echarts';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [
    NgxEchartsDirective
  ],
  providers: [provideEcharts()],
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
})
export class ChartComponent implements OnInit {
  @Input('chartOptions') chartOptions: EChartsOption = {};

  constructor() { }

  ngOnInit() { }

}
