import { Component } from '@angular/core';
import { SetupService } from '../setup.service';
import { map, Observable } from 'rxjs';
import { QueryService } from '../query.service';
import { Composition } from '../models';

@Component({
  selector: 'select-opponent-composition',
  templateUrl: './select-opponent-composition.component.html',
  styleUrls: ['../app.component.css'],
})
export class SelectOpponentCompositionComponent {
  compositions: Promise<Composition[]>;
  constructor(private setupService: SetupService, private queryService: QueryService) {
    this.compositions = setupService.constants.then((setup) =>
      setup.comps.sort((a, b) => (a.label > b.label ? 1 : -1))
    );
  }

  selectComposition(composition?: Composition) {
    this.queryService.setOpponentCompsition(composition);
  }
}
