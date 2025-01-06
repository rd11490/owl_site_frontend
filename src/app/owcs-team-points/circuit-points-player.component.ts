import { Component, Input } from '@angular/core';
import { TeamPlayerCircuitPoints } from '../models';

@Component({
  selector: 'circuit-points-player',
  templateUrl: './circuit-points-player.component.html',
  styleUrls: ['../app.component.css', './circuit-points-player.css'],
})
export class CircuitPointsPlayerComponent {
  playerInfo: TeamPlayerCircuitPoints | undefined;
  index: number = 0;

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
    return this.index < 5;
  }

  displayNotCountsInCalc() {
    return this.index > 4;
  }

  @Input()
  set player(playerInfo: TeamPlayerCircuitPoints) {
    this.playerInfo = playerInfo;
  }

  @Input()
  set indexNum(index: number) {
    this.index = index;
  }
}
