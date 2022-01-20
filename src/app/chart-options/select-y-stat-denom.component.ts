import { Component, OnInit, ViewChild } from '@angular/core';
import { QueryService } from '../query.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ChartService } from '../chart.service';

@Component({
  selector: 'select-y-stat-denom',
  templateUrl: './select-y-stat-denom.component.html',
  styleUrls: ['../app.component.css'],
})
export class SelectYStatDenomComponent implements OnInit {
  stats: Promise<string[]>;
  constructor(
    // eslint-disable-next-line no-unused-vars
    private queryService: QueryService,
    // eslint-disable-next-line no-unused-vars
    private route: ActivatedRoute,
    // eslint-disable-next-line no-unused-vars
    private router: Router,
    // eslint-disable-next-line no-unused-vars
    private chartService: ChartService
  ) {
    this.stats = queryService.queryResponse.then((resp) => ['Per 10'].concat(resp.stats.sort()));
  }

  @ViewChild(NgSelectComponent, { static: false }) ngSelect!: NgSelectComponent;

  ngOnInit() {
    if (this.chartService.yDenom) {
      this.queryService.queryResponse.then((resp) => {
        const selection = ['Per 10'].concat(resp.stats).filter((v) => v === this.chartService.yDenom)[0];
        this.ngSelect.select({
          name: [selection],
          label: selection,
          value: selection,
        });
      });
    }
  }
  selectYDenom(y?: string) {
    this.chartService.selectYDenom(y);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        yStatDenom: y,
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }
}
