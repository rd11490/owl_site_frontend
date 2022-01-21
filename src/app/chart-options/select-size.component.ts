import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { QueryService } from '../query.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ChartService } from '../chart.service';

@Component({
  selector: 'select-size',
  templateUrl: './select-size.component.html',
  styleUrls: ['../app.component.css'],
})
export class SelectSizeComponent implements OnInit {
  stats: string[] = [];
  constructor(
    // eslint-disable-next-line no-unused-vars
    private queryService: QueryService,
    // eslint-disable-next-line no-unused-vars
    private route: ActivatedRoute,
    // eslint-disable-next-line no-unused-vars
    private router: Router,
    // eslint-disable-next-line no-unused-vars
    private chartService: ChartService
  ) {}

  @ViewChild(NgSelectComponent, { static: false }) ngSelect!: NgSelectComponent;

  ngOnInit() {
    if (this.chartService.size) {
      this.queryService.queryResponse.then((resp) => {
        const selection = resp.stats.filter((v) => v === this.chartService.size)[0];
        this.ngSelect.select({
          name: [selection],
          label: selection,
          value: selection,
        });
      });
    }
  }
  selectSize(size?: string) {
    this.chartService.selectSize(size);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        size: size,
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
