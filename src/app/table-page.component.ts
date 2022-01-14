import { Component, OnInit, ViewChild } from '@angular/core';
import { QueryService } from './query.service';
import { QueryResponse, QueryResponseRow } from './models';
import { SetupService } from './setup.service';
import { camelize } from './camelize';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

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
  stats: Promise<string[]>;
  loading: boolean = false;
  loaded: boolean = false;

  constructor(private queryService: QueryService, private setupService: SetupService) {
    this.stats = setupService.constants.then((setup) => setup.stats.sort());
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
