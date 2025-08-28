import { Component, OnInit, ViewChild } from '@angular/core';
import { SetupService } from '../setup.service';
import { QueryService } from '../query.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'select-stage',
  templateUrl: './select-stage.component.html',
  styleUrls: ['../app.component.css'],
})
export class SelectStageComponent implements OnInit {
  stages: Promise<string[]>;
  constructor(
    private setupService: SetupService,
    // eslint-disable-next-line no-unused-vars
    private queryService: QueryService,
    // eslint-disable-next-line no-unused-vars
    private route: ActivatedRoute,
    // eslint-disable-next-line no-unused-vars
    private router: Router,
  ) {
    this.stages = setupService.constants.then((setup) => setup.stages);
  }

  @ViewChild(NgSelectComponent, { static: false }) ngSelect!: NgSelectComponent;

  ngOnInit() {
    if (this.queryService.stages) {
      // eslint-disable-next-line no-unused-vars
      this.setupService.constants.then((s) => {
        this.queryService.stages.forEach((stage) => {
          if (this.ngSelect.selectedItems.filter((v) => v.label == stage).length < 1) {
            const stageSelection = s.stages.find((h) => h == stage);
            if (stageSelection) {
              this.ngSelect.select({
                name: [stageSelection],
                label: stageSelection,
                value: stageSelection,
              });
            }
          }
        });
      });
    }
  }

  selectStages(stages: Array<string>) {
    this.queryService.setStages(stages);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        stages: stages.length === 0 ? undefined : stages.join(','),
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }
}
