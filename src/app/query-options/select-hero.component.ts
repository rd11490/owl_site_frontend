import { Component } from '@angular/core';
import { SetupService } from '../setup.service';
import { map, Observable } from 'rxjs';
import { QueryService } from '../query.service';
import { Player } from '../models';

@Component({
  selector: 'select-hero',
  templateUrl: './select-hero.component.html',
  styleUrls: ['../app.component.css'],
})
export class SelectHeroComponent {
  heroes: Promise<string[]>;
  constructor(private setupService: SetupService, private queryService: QueryService) {
    this.heroes = setupService.constants.then((setup) => setup.heroes.sort());
  }

  selectHeroes(heroes: Array<string>) {
    this.queryService.setHeroes(heroes);
  }
}
