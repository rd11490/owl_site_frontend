import { Component } from '@angular/core';
import { QueryService } from './query.service';
import { PlotData, QueryResponse } from './models';
import { SetupService } from './setup.service';
import { ActivatedRoute } from '@angular/router';
import { ChartService } from './chart.service';

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

  x?: string;
  y?: string;
  xDenom?: string;
  yDenom?: string;
  size?: string;

  constructor(
    // eslint-disable-next-line no-unused-vars
    private queryService: QueryService,
    // eslint-disable-next-line no-unused-vars
    private setupService: SetupService,
    // eslint-disable-next-line no-unused-vars
    private route: ActivatedRoute,
    // eslint-disable-next-line no-unused-vars
    private chartService: ChartService
  ) {
    const queryParams = this.route.snapshot.queryParams != null ? this.route.snapshot.queryParams : undefined;
    if (queryParams && Object.keys(queryParams).length > 0) {
      if (queryParams['aggregation']) {
        this.queryService.setAggregationType(queryParams['aggregation']);
      }

      if (queryParams['composition']) {
        this.queryService.setCompsition(
          queryParams['composition'].split(',').map((c: string) => ({
            cluster: c,
          }))
        );
      }

      if (queryParams['opponentComposition']) {
        this.queryService.setOpponentCompsition(
          queryParams['opponentComposition'].split(',').map((c: string) => ({
            cluster: c,
          }))
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
          }))
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
      this.search();
    }
  }

  search() {
    this.loading = true;
    this.loaded = false;

    this.queryService.runQuery().then((resp) => {
      this.queryResponse = resp;
      this.loading = false;
      this.loaded = true;
      if (resp.data.length > 0) {
        this.showSelector = false;
      }
      this.buildChart();
    });
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
  }

  buildChart() {
    this.chartService.buildChartData();
    this.data = this.chartService.data;
  }
}
