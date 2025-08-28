import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { QueryService } from '../query.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ChartService } from '../chart.service';

@Component({
  selector: 'select-x-stat',
  templateUrl: './select-x-stat.component.html',
  styleUrls: ['../app.component.css'],
})
export class SelectXStatComponent implements OnInit {
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
    if (this.chartService.x) {
      this.queryService.queryResponse.then((resp) => {
        const selection = resp.stats.filter((v) => v === this.chartService.x)[0];
        this.ngSelect.select({
          name: [selection],
          label: selection,
          value: selection,
        });
      });
    }
  }

  public clear() {
    this.ngSelect.handleClearClick();
  }

  selectX(x?: string) {
    this.chartService.selectX(x);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        xStat: x,
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }

  @Input()
  set statList(stats: string[]) {
    this.stats = stats;
  }
}
