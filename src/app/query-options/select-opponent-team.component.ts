import { Component } from '@angular/core';
import { SetupService } from '../setup.service';
import { QueryService } from '../query.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'select-opponent-team',
  templateUrl: './select-opponent-team.component.html',
  styleUrls: ['../app.component.css'],
})
export class SelectOpponentTeamComponent {
  teams: Promise<string[]>;
  constructor(
    private setupService: SetupService,
    // eslint-disable-next-line no-unused-vars
    private queryService: QueryService,
    // eslint-disable-next-line no-unused-vars
    private route: ActivatedRoute,
    // eslint-disable-next-line no-unused-vars
    private router: Router
  ) {
    this.teams = setupService.constants.then((setup) => setup.teams.sort());
  }

  selectOpponentTeams(teams: Array<string>) {
    this.queryService.setOpponentTeams(teams);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        opponentTeams: teams,
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }
}
