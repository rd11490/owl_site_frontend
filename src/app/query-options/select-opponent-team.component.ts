import { Component } from '@angular/core';
import { SetupService } from '../setup.service';
import { map, Observable } from 'rxjs';
import { QueryService } from '../query.service';

@Component({
  selector: 'select-opponent-team',
  templateUrl: './select-opponent-team.component.html',
  styleUrls: ['../app.component.css'],
})
export class SelectOpponentTeamComponent {
  teams: Promise<string[]>;
  constructor(private setupService: SetupService, private queryService: QueryService) {
    this.teams = setupService.constants.then((setup) => setup.teams.sort());
  }

  selectOpponentTeams(teams: Array<string>) {
    this.queryService.setOpponentTeams(teams);
  }
}
