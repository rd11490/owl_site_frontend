import { Component, OnInit, ViewChild } from '@angular/core';
import { SetupService } from '../setup.service';
import { QueryService } from '../query.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'select-team',
  templateUrl: './select-team.component.html',
  styleUrls: ['../app.component.css'],
})
export class SelectTeamComponent implements OnInit {
  teams: Promise<string[]>;
  constructor(
    private setupService: SetupService,
    // eslint-disable-next-line no-unused-vars
    private queryService: QueryService,
    // eslint-disable-next-line no-unused-vars
    private route: ActivatedRoute,
    // eslint-disable-next-line no-unused-vars
    private router: Router,
  ) {
    this.teams = setupService.constants.then((setup) => setup.teams.sort());
  }

  @ViewChild(NgSelectComponent, { static: false }) ngSelect!: NgSelectComponent;

  ngOnInit() {
    if (this.queryService.teams) {
      // eslint-disable-next-line no-unused-vars
      this.setupService.constants.then((s) => {
        this.queryService.teams.forEach((team) => {
          if (this.ngSelect.selectedItems.filter((v) => v.value == team).length < 1) {
            const teamsToSelect = s.teams.find((t) => t == team);
            if (teamsToSelect) {
              this.ngSelect.select({
                name: [teamsToSelect],
                label: teamsToSelect,
                value: teamsToSelect,
              });
            }
          }
        });
      });
    }
  }

  selectTeams(teams: Array<string>) {
    this.queryService.setTeams(teams);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        teams: teams.length === 0 ? undefined : teams.join(','),
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }
}
