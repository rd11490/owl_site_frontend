import { Component, OnInit } from '@angular/core';
import { QueryService } from '../query.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ChartService } from '../chart.service';

@Component({
  selector: 'time-played',
  templateUrl: './time-played-filter.component.html',
  styleUrls: ['../app.component.css'],
})
export class TimePlayedFilterComponent implements OnInit {
  minTime?: number;
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

  ngOnInit() {
    if (this.chartService.minTime) {
      this.minTime = this.chartService.minTime;
    }
  }

  resetTimePlayed() {
    this.minTime = undefined;
    this.setTimePlayed();
  }

  setTimePlayed() {
    this.chartService.selectMinTime(this.minTime);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        minTime: this.minTime,
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }

  public clear() {
    this.minTime = undefined;
  }
}
