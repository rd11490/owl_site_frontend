import { Component, OnInit, ViewChild } from '@angular/core';
import { QueryService } from '../query.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { SetupService } from '../setup.service';

@Component({
  selector: 'select-aggregation-type',
  templateUrl: './select-aggregation-type.component.html',
  styleUrls: ['../app.component.css'],
})
export class SelectAggregationTypeComponent implements OnInit {
  aggregationType: { label: string; value: string }[];
  constructor(
    // eslint-disable-next-line no-unused-vars
    private setupService: SetupService,
    // eslint-disable-next-line no-unused-vars
    private queryService: QueryService,
    // eslint-disable-next-line no-unused-vars
    private route: ActivatedRoute,
    // eslint-disable-next-line no-unused-vars
    private router: Router,
  ) {
    this.aggregationType = [
      { value: 'PLAYER', label: 'By Player' },
      { value: 'TEAM', label: 'By Team' },
      { value: 'HERO', label: 'By Hero' },
      { value: 'TEAMANDHERO', label: 'By Team and Hero' },
      { value: 'PLAYERANDHERO', label: 'By Player and Hero' },
    ];
  }

  @ViewChild(NgSelectComponent, { static: false }) ngSelect!: NgSelectComponent;

  ngOnInit() {
    if (this.queryService.aggregationType) {
      this.setupService.constants.then((s) => {
        const selection = this.aggregationType.filter((v) => v.value === this.queryService.aggregationType)[0];
        this.ngSelect.select({
          label: selection.label,
          value: selection,
        });
      });
    }
  }

  selectAggregationType(event: any) {
    if (event && event.value) {
      this.queryService.setAggregationType(event.value);

      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          aggregation: event.value,
        },
        queryParamsHandling: 'merge',
        skipLocationChange: false,
      });
    }
  }
}
