import { Injectable } from '@angular/core';
import { DataPointForPlot, PlotData, QueryResponseRow } from './models';
import { QueryService } from './query.service';
import { getHeroColor, getPlayerColor, getTeamColor } from './utils/teamColors';
import { camelize } from './utils/camelize';
import { SetupService } from './setup.service';

@Injectable()
export class ChartService {
  x?: string;
  y?: string;
  xDenom?: string;
  yDenom?: string;
  size?: string;
  minTime?: number;
  data?: PlotData;

  // eslint-disable-next-line no-unused-vars
  constructor(
    private queryService: QueryService,
    private setupService: SetupService,
  ) {}

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

  selectMinTime(time?: number) {
    this.minTime = time;
  }

  buildTestData(): PlotData {
    return {
      xLabel: 'TESTX PLUS A BUNCH OF OTHER NONSENSE',
      yLabel: 'TESTY PLUS A BUNCH OF OTHER NONSENSE',
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

  private getColorStrategy(): 'player' | 'hero' | 'team' {
    if (!this.queryService.queryResponseSync?.data) {
      return 'hero'; // Default to hero colors if no data
    }

    const data = this.queryService.queryResponseSync.data;
    
    // Count unique values for each category
    const uniqueValues = {
      player: new Set(data.map(row => row.player).filter(Boolean)).size,
      hero: new Set(data.map(row => row.hero).filter(Boolean)).size,
      team: new Set(data.map(row => row.teamName).filter(Boolean)).size
    };

    // Return the category with the most unique values
    if (uniqueValues.player >= uniqueValues.hero && uniqueValues.player >= uniqueValues.team) {
      return 'player';
    } else if (uniqueValues.hero >= uniqueValues.team) {
      return 'hero';
    } else {
      return 'team';
    }
  }

  private getColor(row: QueryResponseRow): string {
    const strategy = this.getColorStrategy();
    
    switch (strategy) {
      case 'player':
        return row.player ? 
          getPlayerColor(row.player, this.setupService.constantsSync.players) : 
          '#000000';
      case 'hero':
        return row.hero ? 
          getHeroColor(row.hero) : 
          '#000000';
      case 'team':
        return row.teamName ? 
          getTeamColor(row.teamName) : 
          '#000000';
    }
  }

  private getLabel(row: QueryResponseRow): string {
    if (row.teamName && row.hero) {
      return `${row.teamName} - ${row.hero}`;
    } else if (row.player && row.hero) {
      return `${row.player} - ${row.hero}`;
    } else {
      return row.hero || row.player || row.teamName || '';
    }
  }

  private getLabelAdditional(row: QueryResponseRow): string | undefined {
    return row.player
      ? this.setupService.constantsSync.players.find((player) => row.player === player.player)?.teamName
      : undefined;
  }

  public buildChartData() {
    console.log('Building chart data with:', { x: this.x, y: this.y, xDenom: this.xDenom, yDenom: this.yDenom, size: this.size });
    if (!this.queryService.queryResponseSync?.data?.length) {
      console.log('No query data available');
      return;
    }
    if (this.x != null && this.y != null && this.queryService.queryResponseSync.data.length > 0) {
      console.log('Building chart with query data:', this.queryService.queryResponseSync.data.length, 'rows');
      let xLabel: string;
      let yLabel: string;

      if (this.xDenom) {
        if (this.xDenom != 'Per 10') {
          xLabel = `${this.x} Per ${this.xDenom}`;
        } else {
          xLabel = `${this.x} Per 10`;
        }
      } else {
        xLabel = this.x || 'No Y Stat Selected';
      }

      if (this.yDenom) {
        if (this.yDenom != 'Per 10') {
          yLabel = `${this.y} Per ${this.yDenom}`;
        } else {
          yLabel = `${this.y} Per 10`;
        }
      } else {
        yLabel = this.y || 'No Y Stat Selected';
      }

      // @ts-ignore
      const plotDataRows: DataPointForPlot[] = this.queryService.queryResponseSync.data
        .map((row) => {
          const per10 = row.timePlayed ? row.timePlayed / 600.0 : 0;

          if (this.minTime && row.timePlayed && row.timePlayed < this.minTime * 60) {
            return undefined;
          }

          // @ts-ignore
          const obj: { [key: string]: number } = {
            ...row,
            per10,
          };

          const xNum = obj[camelize(this.x || '')];
          const yNum = obj[camelize(this.y || '')];
          const xDenom = obj[camelize(this.xDenom || '')] || 1;
          const yDenom = obj[camelize(this.yDenom || '')] || 1;
          const size = obj[camelize(this.size || '')] || 5;

          if (!xNum || !yNum || !size) {
            return undefined;
          }

          return {
            color: this.getColor(row),
            label: this.getLabel(row),
            size,
            sizeLabel: this.size,
            x: xNum / xDenom,
            xLabel,
            y: yNum / yDenom,
            yLabel,
            labelAdditional: this.getLabelAdditional(row),
          } as DataPointForPlot;
        })
        .filter((v) => v != null);

      this.data = {
        data: plotDataRows,
        xLabel,
        yLabel,
      };
    }
  }
}
