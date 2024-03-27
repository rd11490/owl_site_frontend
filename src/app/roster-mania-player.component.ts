import { Component, Input } from '@angular/core';
import { PlayerCircuitPoints } from './models';

@Component({
  selector: 'roster-mania-player',
  templateUrl: './roster-mania-player.component.html',
  styleUrls: ['./app.component.css', './roster-mania-page.css', './roster-mania-player.css'],
})
export class RosterManiaPlayerComponent {
  playerInfo: PlayerCircuitPoints | undefined;
  index: number = 0;
  onTeam: boolean = false;

  isTank() {
    return (this.playerInfo?.role || []).includes('Tank');
  }

  isDps() {
    return (this.playerInfo?.role || []).includes('Damage');
  }

  isSupport() {
    return (this.playerInfo?.role || []).includes('Support');
  }

  displayCountsInCalc() {
    return this.index < 5 && this.onTeam;
  }

  displayNotCountsInCalc() {
    return this.index > 4 && this.onTeam;
  }

  @Input()
  set player(playerInfo: PlayerCircuitPoints) {
    this.playerInfo = playerInfo;
  }

  @Input()
  set indexNum(index: number) {
    this.index = index;
  }

  @Input()
  set team(onTeam: boolean) {
    this.onTeam = onTeam;
  }
}
