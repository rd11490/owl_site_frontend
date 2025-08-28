import { Component, ViewChild } from '@angular/core';
import { QueryService } from './query.service';
import { PlotData, QueryResponse } from './models';
import { SetupService } from './setup.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ChartService } from './chart.service';
import { SelectXStatComponent } from './chart-options/select-x-stat.component';
import { SelectYStatComponent } from './chart-options/select-y-stat.component';
import { SelectXStatDenomComponent } from './chart-options/select-x-stat-denom.component';
import { SelectYStatDenomComponent } from './chart-options/select-y-stat-denom.component';
import { SelectSizeComponent } from './chart-options/select-size.component';
import { PlotComponent } from './plot.component';

@Component({
  selector: 'chart-page',
  templateUrl: './chart-page.component.html',
  styleUrls: ['./app.component.css'],
})
export class ChartPageComponent {
  queryResponse: QueryResponse = new QueryResponse();
  loading: boolean = false;
  loaded: boolean = false;
  showSelector: boolean = true;
  data?: PlotData = this.chartService.data;
  stats: string[] = [];
  season: string = '2022';

  x?: string;
  y?: string;
  xDenom?: string;
  yDenom?: string;
  size?: string;

  constructor(
    private queryService: QueryService,
    private setupService: SetupService,
    private route: ActivatedRoute,
    private chartService: ChartService,
    private router: Router,
  ) {
    this.route.data.subscribe((v) => {
      this.season = v['season'];
    });
    setupService.getSetup(this.season);
    queryService.setSeason(this.season);
    const queryParams = this.route.snapshot.queryParams != null ? this.route.snapshot.queryParams : undefined;
    if (queryParams && Object.keys(queryParams).length > 0) {
      if (queryParams['aggregation']) {
        this.queryService.setAggregationType(queryParams['aggregation']);
      }

      if (queryParams['composition']) {
        this.queryService.setCompsition(
          queryParams['composition'].split(',').map((c: string) => ({
            cluster: c,
          })),
        );
      }

      if (queryParams['opponentComposition']) {
        this.queryService.setOpponentCompsition(
          queryParams['opponentComposition'].split(',').map((c: string) => ({
            cluster: c,
          })),
        );
      }

      if (queryParams['heroes']) {
        this.queryService.setHeroes(queryParams['heroes'].split(','));
      }

      if (queryParams['mapNames']) {
        this.queryService.setMapNames(queryParams['mapNames'].split(','));
      }

      if (queryParams['mapTypes']) {
        this.queryService.setMapTypes(queryParams['mapTypes'].split(','));
      }

      if (queryParams['teams']) {
        this.queryService.setTeams(queryParams['teams'].split(','));
      }

      if (queryParams['opponentTeams']) {
        this.queryService.setOpponentTeams(queryParams['opponentTeams'].split(','));
      }

      if (queryParams['stages']) {
        this.queryService.setStages(queryParams['stages'].split(','));
      }

      if (queryParams['players']) {
        this.queryService.setPlayers(
          queryParams['players'].split(',').map((p: string) => ({
            player: p,
          })),
        );
      }
      if (queryParams['xStat']) {
        this.chartService.selectX(queryParams['xStat']);
      }

      if (queryParams['yStat']) {
        this.chartService.selectY(queryParams['yStat']);
      }

      if (queryParams['xStatDenom']) {
        this.chartService.selectXDenom(queryParams['xStatDenom']);
      }

      if (queryParams['yStatDenom']) {
        this.chartService.selectYDenom(queryParams['yStatDenom']);
      }

      if (queryParams['size']) {
        this.chartService.selectSize(queryParams['size']);
      }

      if (queryParams['minTime']) {
        this.chartService.selectMinTime(queryParams['minTime']);
      }
      this.search();
    } else if (this.chartService.data) {
      // If we already have data but no query params, update the plot
      this.buildChart();
    }
  }

  @ViewChild(SelectXStatComponent, { static: false }) selectXComp!: SelectXStatComponent;
  @ViewChild(SelectYStatComponent, { static: false }) selectYComp!: SelectYStatComponent;
  @ViewChild(SelectXStatDenomComponent, { static: false }) selectXDenomComp!: SelectXStatDenomComponent;
  @ViewChild(SelectYStatDenomComponent, { static: false }) selectYDenomComp!: SelectYStatDenomComponent;
  @ViewChild(SelectSizeComponent, { static: false }) selectSizeComp!: SelectSizeComponent;
  @ViewChild(PlotComponent, { static: false }) plotComp!: PlotComponent;

  search() {
    this.loading = true;
    this.loaded = false;

    this.queryService.runQuery().then(
      (resp) => {
        this.queryResponse = resp;
        this.loading = false;
        this.loaded = true;
        if (resp.data.length > 0) {
          this.showSelector = false;
        }
        this.stats = resp.stats;
        this.buildChart();
      },
      (error) => {
        console.error('Search failed:', error);
        this.loading = false;
        this.loaded = true;
        this.showSelector = true;
      },
    );
  }

  selectionText() {
    return this.queryService.selectionText();
  }

  selectX(x?: string) {
    this.chartService.selectX(x);
  }

  selectXDenom(xDenom?: string) {
    this.chartService.selectXDenom(xDenom);
  }

  selectY(y?: string) {
    this.chartService.selectY(y);
  }

  selectYDenom(yDenom?: string) {
    this.chartService.selectYDenom(yDenom);
  }

  selectSize(size?: string) {
    this.chartService.selectSize(size);
  }

  buildNewSearch() {
    this.loaded = false;
    this.showSelector = true;

    this.chartService.selectX(undefined);
    this.chartService.selectY(undefined);
    this.chartService.selectXDenom(undefined);
    this.chartService.selectYDenom(undefined);
    this.chartService.selectSize(undefined);

    this.selectXComp.clear();
    this.selectYComp.clear();
    this.selectXDenomComp.clear();
    this.selectYDenomComp.clear();
    this.selectSizeComp.clear();
    this.plotComp.clearPlot();

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        xStat: undefined,
        xStatDenom: undefined,
        yStat: undefined,
        yStatDenom: undefined,
        size: undefined,
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }

  buildChart() {
    console.log('Building chart...');
    this.chartService.buildChartData();
    if (this.chartService.data) {
      console.log('Chart data available:', this.chartService.data);
      // Force Angular change detection by creating a new object
      this.data = {
        data: [...this.chartService.data.data],
        xLabel: this.chartService.data.xLabel,
        yLabel: this.chartService.data.yLabel
      };
    }
  }
}
