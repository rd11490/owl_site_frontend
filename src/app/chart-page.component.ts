import { Component } from '@angular/core';
import { QueryService } from './query.service';
import { QueryResponse, QueryResponseRow } from './models';
import { MatTableDataSource } from '@angular/material/table';
import { SetupService } from './setup.service';

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

  constructor(private queryService: QueryService, private setupService: SetupService) {
    this.stats = setupService.constants.then((setup) => setup.stats.sort());
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
}
