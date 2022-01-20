import { Component, OnInit, ViewChild } from '@angular/core';
import { QueryService } from './query.service';
import { QueryResponse, QueryResponseRow } from './models';
import { SetupService } from './setup.service';
import { camelize } from './utils/camelize';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'table-page',
  templateUrl: './table-page.component.html',
  styleUrls: ['./app.component.css'],
})
export class TablePageComponent implements OnInit {
  @ViewChild(MatSort, { static: false }) sort!: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;

  queryResponse: QueryResponse = new QueryResponse();
  dataSource: MatTableDataSource<QueryResponseRow> = new MatTableDataSource<QueryResponseRow>(this.queryResponse.data);
  columnsToDisplay: string[] = ['player'];
  loading: boolean = false;
  loaded: boolean = false;

  // eslint-disable-next-line no-unused-vars
  constructor(private queryService: QueryService, private setupService: SetupService, private route: ActivatedRoute) {
    const queryParams = this.route.snapshot.queryParams != null ? this.route.snapshot.queryParams : undefined;
    if (queryParams) {
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
    }
    this.search();
  }

  ngOnInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  search() {
    console.log('PRESSED SEARCH!');
    this.loading = true;
    this.loaded = false;

    this.queryService.runQuery().then((resp) => {
      this.queryResponse = resp;
      this.dataSource = new MatTableDataSource<QueryResponseRow>(this.queryResponse.data);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.loading = false;
      this.loaded = true;
      this.selectStats([]);
    });
  }

  selectStats(stats: string[]) {
    const camelStats = stats.map((s) => camelize(s));
    this.columnsToDisplay = [this.queryService.aggregationType?.toLowerCase() || 'player', 'timePlayed'].concat(
      camelStats
    );
  }
}
