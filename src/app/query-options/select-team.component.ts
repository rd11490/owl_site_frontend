import { Component } from '@angular/core';
import { SetupService } from '../setup.service';
import { map, Observable } from 'rxjs';
import { QueryService } from '../query.service';

@Component({
  selector: 'select-team',
  templateUrl: './select-team.component.html',
  styleUrls: ['../app.component.css'],
})
export class SelectTeamComponent {
  teams: Promise<string[]>;
  constructor(private setupService: SetupService, private queryService: QueryService) {
    this.teams = setupService.constants.then((setup) => setup.teams.sort());
  }

  selectTeams(teams: Array<string>) {
    this.queryService.setTeams(teams);
  }
}
