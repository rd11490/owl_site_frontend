import { Component } from '@angular/core';
import { SetupService } from '../setup.service';
import { QueryService } from '../query.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'select-stage',
  templateUrl: './select-stage.component.html',
  styleUrls: ['../app.component.css'],
})
export class SelectStageComponent {
  stages: Promise<string[]>;
  constructor(
    private setupService: SetupService,
    // eslint-disable-next-line no-unused-vars
    private queryService: QueryService,
    // eslint-disable-next-line no-unused-vars
    private route: ActivatedRoute,
    // eslint-disable-next-line no-unused-vars
    private router: Router
  ) {
    this.stages = setupService.constants.then((setup) => setup.stages);
  }

  selectStages(stages: Array<string>) {
    this.queryService.setStages(stages);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        stages: stages,
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }
}
