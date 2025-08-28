import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { QueryService } from '../query.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ChartService } from '../chart.service';

@Component({
  selector: 'select-y-stat',
  templateUrl: './select-y-stat.component.html',
  styleUrls: ['../app.component.css'],
})
export class SelectYStatComponent implements OnInit {
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
    if (this.chartService.y) {
      this.queryService.queryResponse.then((resp) => {
        const selection = resp.stats.filter((v) => v === this.chartService.y)[0];
        this.ngSelect.select({
          name: [selection],
          label: selection,
          value: selection,
        });
      });
    }
  }
  selectY(y?: string) {
    this.chartService.selectY(y);
    this.chartService.buildChartData();

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        yStat: y,
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
    this.stats = stats;
  }
}
