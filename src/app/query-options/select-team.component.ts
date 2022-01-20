import { Component } from '@angular/core';
import { SetupService } from '../setup.service';
import { QueryService } from '../query.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'select-team',
  templateUrl: './select-team.component.html',
  styleUrls: ['../app.component.css'],
})
export class SelectTeamComponent {
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

  selectTeams(teams: Array<string>) {
    this.queryService.setTeams(teams);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        teams: teams,
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }
}
