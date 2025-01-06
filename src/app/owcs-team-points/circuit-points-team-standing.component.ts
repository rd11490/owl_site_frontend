import { Component, Input } from '@angular/core';
import { TeamPoints } from '../models';

@Component({
  selector: 'circuit-points-team-standing',
  templateUrl: './circuit-points-team-standing.component.html',
  styleUrls: ['../app.component.css', './circuit-points-team-standing.css'],
})
export class CircuitPointsTeamStandingComponent {
  teamInfo: TeamPoints | undefined;
  placement: number = 0;

  displayQualified() {
    return this.placement < 3;
  }

  displayNotQualified() {
    return this.placement >= 3;
  }

  placementLabel(): string {
    return (this.placement + 1).toString();
  }

  @Input()
  set teamPoints(teamPoints: TeamPoints) {
    this.teamInfo = teamPoints;
  }

  @Input()
  set indexNum(index: number) {
    this.placement = index;
  }
}
