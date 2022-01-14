import { Component } from '@angular/core';
import { SetupService } from '../setup.service';
import { QueryService } from '../query.service';
import { Composition } from '../models';

@Component({
  selector: 'select-composition',
  templateUrl: './select-composition.component.html',
  styleUrls: ['../app.component.css'],
})
export class SelectCompositionComponent {
  compositions: Promise<Composition[]>;
  constructor(private setupService: SetupService, private queryService: QueryService) {
    this.compositions = setupService.constants.then((setup) =>
      setup.comps.sort((a, b) => (a.label > b.label ? 1 : -1))
    );
  }

  selectComposition(composition?: Composition) {
    this.queryService.setCompsition(composition);
  }
}
