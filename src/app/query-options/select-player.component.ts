import { Component, OnInit, ViewChild } from '@angular/core';
import { SetupService } from '../setup.service';
import { QueryService } from '../query.service';
import { Player } from '../models';
import { ActivatedRoute, Router } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'select-player',
  templateUrl: './select-player.component.html',
  styleUrls: ['../app.component.css'],
})
export class SelectPlayerComponent implements OnInit {
  players: Promise<Player[]>;
  constructor(
    private setupService: SetupService,
    // eslint-disable-next-line no-unused-vars
    private queryService: QueryService,
    // eslint-disable-next-line no-unused-vars
    private route: ActivatedRoute,
    // eslint-disable-next-line no-unused-vars
    private router: Router,
  ) {
    this.players = setupService.constants.then((setup) => setup.players.sort((a, b) => (a.player > b.player ? 1 : -1)));
  }

  @ViewChild(NgSelectComponent, { static: false }) ngSelect!: NgSelectComponent;

  ngOnInit() {
    if (this.queryService.players) {
      // eslint-disable-next-line no-unused-vars
      this.setupService.constants.then((s) => {
        this.queryService.players.forEach((player) => {
          if (this.ngSelect.selectedItems.filter((v) => v.value == player.player).length < 1) {
            const teamsToSelect = s.players.find((t) => t.player == player.player);
            if (teamsToSelect) {
              this.ngSelect.select({
                name: [player.player],
                label: player.player,
                value: player,
              });
            }
          }
        });
      });
    }
  }

  selectPlayer(players: Array<Player>) {
    this.queryService.setPlayers(players);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        players: players.length === 0 ? undefined : players.map((p) => p.player).join(','),
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }
}
