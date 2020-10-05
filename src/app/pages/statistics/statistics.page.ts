import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { retry } from 'rxjs/operators';
import { StorageService } from 'src/app/services/storage.service';
import { UiUtilitiesService } from 'src/app/services/ui-utilities.service';
import { StatisticsService } from '../../services/statistics.service';

import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { Label } from 'ng2-charts';
import { Chart } from 'chart.js';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.page.html',
  styleUrls: ['./statistics.page.scss'],
})
export class StatisticsPage implements OnInit, OnDestroy {
  @ViewChild('dayChart') dayChartContent: ElementRef;
  @ViewChild('weekChart') weekChartContent: ElementRef;
  statisticsSbc: Subscription;
  statiDaySbc: Subscription;

  dayChart: Chart;
  weekChart: Chart;

  barChartLegend = true;
  barChartPlugins = [pluginDataLabels];



  // tslint:disable-next-line: max-line-length
  constructor( private st: StorageService, private ui: UiUtilitiesService, private statSvc: StatisticsService, public io: SocketService ) { }

  ngOnInit() {
    this.st.onLoadToken().then( () => {
      this.onLoadWeek();
      this.onLoadDay();
    });
  }

  onLoadWeek() {
    this.statisticsSbc = this.statSvc.onGetWeek()
    .pipe( retry() )
    .subscribe( (res) => {

      if (!res.ok) {
        throw new Error( res.error );
      }

      let data = [0, 0, 0, 0, 0, 0, 0];

      if (res.total === 1 ) {
        data = [];
        for (let index = 0; index < 7; index++) {

          try {
            console.log( 'rec', res.data[index]);
            data.push( Number( res.data[index].totalFinaliced ) || 0 );
          } catch (error) {
            data.push(0);
          }
          // const element = res.data[index].totalFinaliced || 0;
        }
      }

      this.weekChart = new Chart( this.weekChartContent.nativeElement, {
        type: 'bar',
        data: {
          labels: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'],
          datasets: [
            {
              data,
              label: 'Servicios finalizados',
              backgroundColor: [
                'rgba(255,0,0,0.3)',
                'rgba(0,255,0,0.3)',
                'rgba(0,0,255,0.3)',
                'rgba(0, 153, 255, 0.3)',
                'rgba(255, 102, 0, 0.3)',
                'rgba(51, 255, 0, 0.3)',
                'rgba(255, 0, 149, 0.3)'
              ],
            }
          ]
        },
        // plugins: [pluginDataLabels ],
        options: {
          // legend: true,
          // We use these empty structures as placeholders for dynamic theming.
          responsive: true,
          scales: { xAxes: [{}], yAxes: [{}] },
          plugins: {
            datalabels: {
              anchor: 'end',
              align: 'end',
              
            },

          }
        }
      });
      this.weekChart.update();

      console.log('respuesta week', res);
    });
  }


  onLoadDay() {

    this.statiDaySbc = this.statSvc.onGetDay()
    .pipe( retry() )
    .subscribe( (res) => {

      if (!res.ok) {
        throw new Error( res.error );
      }

      this.dayChart = new Chart( this.dayChartContent.nativeElement, {
        type: 'pie',
        data: {
          labels: [ 'Finalizados', 'Cancelados'],
          datasets: [
            {
              data: [ res.data.totalFinaliced || 0, res.data.totalCanceled || 0 ],
              backgroundColor: ['rgba(0,255,0,0.3)', 'rgba(255,0,0,0.3)'],
            }
          ],
        },

        // plugins: [ pluginDataLabels ],
        options: {
          // We use these empty structures as placeholders for dynamic theming.
          responsive: true,
          legend: {
            position: 'top',
          },
          plugins: {
            datalabels: {
              formatter: (value, ctx) => {
                const label = ctx.chart.data.labels[ctx.dataIndex];
                return value;
              },
            },
          },
        }
      });

      this.dayChart.update();


    });

  }

  ngOnDestroy() {

    if (this.statisticsSbc) {
      this.statisticsSbc.unsubscribe();
    }

    if (this.statiDaySbc) {
      this.statiDaySbc.unsubscribe();
    }

  }

}
