import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { QueryService } from '../query.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ChartService } from '../chart.service';

@Component({
  selector: 'select-x-stat-denom',
  templateUrl: './select-x-stat-denom.component.html',
  styleUrls: ['../app.component.css'],
})
export class SelectXStatDenomComponent implements OnInit {
  stats: string[] = [];
  constructor(
    // eslint-disable-next-line no-unused-vars
    private queryService: QueryService,
    // eslint-disable-next-line no-unused-vars
    private route: ActivatedRoute,
    // eslint-disable-next-line no-unused-vars
    private router: Router,
    // eslint-disable-next-line no-unused-vars
    private chartService: ChartService,
  ) {}

  @ViewChild(NgSelectComponent, { static: false }) ngSelect!: NgSelectComponent;

  ngOnInit() {
    if (this.chartService.xDenom) {
      this.queryService.queryResponse.then((resp) => {
        const selection = ['Per 10'].concat(resp.stats).filter((v) => v === this.chartService.xDenom)[0];
        this.ngSelect.select({
          name: [selection],
          label: selection,
          value: selection,
        });
      });
    }
  }
  selectXDenom(x?: string) {
    this.chartService.selectXDenom(x);
    this.chartService.buildChartData();

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        xStatDenom: x,
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }

  public clear() {
    this.ngSelect.handleClearClick();
  }

  @Input()
  set statList(stats: string[]) {
    this.stats = ['Per 10'].concat(stats);
  }
}
