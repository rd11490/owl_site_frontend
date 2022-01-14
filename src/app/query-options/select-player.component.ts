import { Component } from '@angular/core';
import { SetupService } from '../setup.service';
import { map, Observable } from 'rxjs';
import { QueryService } from '../query.service';
import { Player } from '../models';

@Component({
  selector: 'select-player',
  templateUrl: './select-player.component.html',
  styleUrls: ['../app.component.css'],
})
export class SelectPlayerComponent {
  players: Promise<Player[]>;
  constructor(private setupService: SetupService, private queryService: QueryService) {
    this.players = setupService.constants.then((setup) => setup.players.sort((a, b) => (a.player > b.player ? 1 : -1)));
  }

  selectPlayer(players: Array<Player>) {
    this.queryService.setPlayers(players);
  }
}
