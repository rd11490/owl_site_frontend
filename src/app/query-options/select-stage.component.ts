import { Component } from '@angular/core';
import { SetupService } from '../setup.service';
import { map, Observable } from 'rxjs';
import { QueryService } from '../query.service';

@Component({
  selector: 'select-stage',
  templateUrl: './select-stage.component.html',
  styleUrls: ['../app.component.css'],
})
export class SelectStageComponent {
  stages: Promise<string[]>;
  constructor(private setupService: SetupService, private queryService: QueryService) {
    this.stages = setupService.constants.then((setup) => setup.stages.sort());
  }

  selectStages(stages: Array<string>) {
    this.queryService.setStages(stages);
  }
}
