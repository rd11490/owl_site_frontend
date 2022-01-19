import { Component } from '@angular/core';
import { QueryService } from './query.service';
import { DataPointForPlot, PlotData, QueryResponse, QueryResponseRow } from './models';
import { SetupService } from './setup.service';
import { getPlayerColor, getTeamColor } from './utils/teamColors';
import { camelize } from './utils/camelize';

@Component({
  selector: 'chart-page',
  templateUrl: './chart-page.component.html',
  styleUrls: ['./app.component.css'],
})
export class ChartPageComponent {
  queryResponse: QueryResponse = new QueryResponse();
  stats: Promise<string[]>;
  loading: boolean = false;
  loaded: boolean = false;

  x?: string;
  y?: string;
  xDenom?: string;
  yDenom?: string;
  size?: string;
  data?: PlotData = this.buildTestData();

  dataString?: string;

  constructor(private queryService: QueryService, private setupService: SetupService) {
    this.stats = setupService.constants.then((setup) => setup.stats.sort().concat(['Per 10']));
  }

  buildTestData(): PlotData {
    return {
      xLabel: 'TESTX',
      yLabel: 'TESTY',
      data: [
        {
          color: '#000000',
          label: 'test1',
          size: 25 * Math.random(),
          sizeLabel: 'random',
          x: 50 * Math.random(),
          xLabel: 'xlabel',
          y: 12 * Math.random(),
          yLabel: 'label',
        },
        {
          color: '#000000',
          label: 'test2',
          size: 25 * Math.random(),
          sizeLabel: 'random',
          x: 50 * Math.random(),
          xLabel: 'xlabel',
          y: 12 * Math.random(),
          yLabel: 'label',
        },
        {
          color: '#000000',
          label: 'test3',
          size: 25 * Math.random(),
          sizeLabel: 'random',
          x: 50 * Math.random(),
          xLabel: 'xlabel',
          y: 12 * Math.random(),
          yLabel: 'label',
        },
        {
          color: '#000000',
          label: 'test4',
          size: 25 * Math.random(),
          sizeLabel: 'random',
          x: 50 * Math.random(),
          xLabel: 'xlabel',
          y: 12 * Math.random(),
          yLabel: 'label',
        },
      ],
    };
  }

  search() {
    this.loading = true;
    this.loaded = false;

    this.queryService.runQuery().then((resp) => {
      this.queryResponse = resp;
      this.loading = false;
      this.loaded = true;
    });
  }

  selectX(x?: string) {
    this.x = x;
  }

  selectXDenom(xDenom?: string) {
    this.xDenom = xDenom;
  }

  selectY(y?: string) {
    this.y = y;
  }

  selectYDenom(yDenom?: string) {
    this.yDenom = yDenom;
  }

  selectSize(size?: string) {
    this.size = size;
  }

  private getColor(row: QueryResponseRow): string {
    if (row.player) {
      return getPlayerColor(row.player, this.setupService.constantsSync.players);
    } else if (row.teamName) {
      return getTeamColor(row.teamName);
    }
    return '#000000';
  }

  private getLabel(row: QueryResponseRow): string {
    return row.hero || row.player || row.teamName || '';
  }

  buildChart() {
    // console.log('Build Chart');
    // console.log(this.data);
    // if (this.x != null && this.y != null && this.queryResponse.data.length > 0) {
    //   let xLabel: string;
    //   let yLabel: string;
    //
    //   if (this.xDenom) {
    //     if (this.xDenom != 'Per 10') {
    //       xLabel = `${this.x} Per ${this.xDenom}`;
    //     } else {
    //       xLabel = `${this.x} Per 10`;
    //     }
    //   } else {
    //     xLabel = this.x || 'No Y Stat Selected';
    //   }
    //
    //   if (this.yDenom) {
    //     if (this.yDenom != 'Per 10') {
    //       yLabel = `${this.y} Per ${this.yDenom}`;
    //     } else {
    //       yLabel = `${this.y} Per 10`;
    //     }
    //   } else {
    //     yLabel = this.y || 'No Y Stat Selected';
    //   }
    //
    //   // @ts-ignore
    //   const plotDataRows: DataPointForPlot[] = this.queryResponse.data
    //     .map((row) => {
    //       const per10 = row.timePlayed ? row.timePlayed / 600.0 : 0;
    //
    //       // @ts-ignore
    //       const obj: { [key: string]: number } = {
    //         ...row,
    //         per10,
    //       };
    //
    //       const xNum = obj[camelize(this.x || '')];
    //       const yNum = obj[camelize(this.y || '')];
    //       const xDenom = obj[camelize(this.xDenom || '')] || 1;
    //       const yDenom = obj[camelize(this.yDenom || '')] || 1;
    //       const size = obj[camelize(this.size || '')] || 5;
    //
    //       if (!xNum || !yNum) {
    //         return undefined;
    //       }
    //
    //       return {
    //         color: this.getColor(row),
    //         label: this.getLabel(row),
    //         size,
    //         sizeLabel: this.size,
    //         x: xNum / xDenom,
    //         xLabel,
    //         y: yNum / yDenom,
    //         yLabel,
    //       } as DataPointForPlot;
    //     })
    //     .filter((v) => v != null);
    //
    //   this.data = {
    //     data: plotDataRows,
    //     xLabel,
    //     yLabel,
    //   };
    // }
    this.data = this.buildTestData();
  }
}
