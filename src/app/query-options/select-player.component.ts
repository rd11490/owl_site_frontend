import { Component } from '@angular/core';
import { SetupService } from '../setup.service';
import { QueryService } from '../query.service';
import { Player } from '../models';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'select-player',
  templateUrl: './select-player.component.html',
  styleUrls: ['../app.component.css'],
})
export class SelectPlayerComponent {
  players: Promise<Player[]>;
  constructor(
    private setupService: SetupService,
    // eslint-disable-next-line no-unused-vars
    private queryService: QueryService,
    // eslint-disable-next-line no-unused-vars
    private route: ActivatedRoute,
    // eslint-disable-next-line no-unused-vars
    private router: Router
  ) {
    this.players = setupService.constants.then((setup) => setup.players.sort((a, b) => (a.player > b.player ? 1 : -1)));
  }

  selectPlayer(players: Array<Player>) {
    this.queryService.setPlayers(players);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        players: players.map((p) => p.player),
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }
}
