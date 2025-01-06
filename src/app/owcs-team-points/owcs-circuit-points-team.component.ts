import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TeamPlayerCircuitPoints, TeamPoints } from '../models';

/**
 * @title Drag&Drop connected sorting
 */
@Component({
  selector: 'owcs-circuit-points-team',
  templateUrl: './owcs-circuit-points-team.component.html',
  styleUrls: ['../app.component.css', './owcs-circuit-points-team.css'],
})
export class OwcsCircuitPointsTeamComponent {
  teamName: string = '';
  players: TeamPlayerCircuitPoints[] = [];
  teamPoints: number = 0;
  placement: number = 0;

  dropPlayers(event: CdkDragDrop<TeamPlayerCircuitPoints[]>) {
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    this.calculatePoints();
    this.updatePoints();
  }

  checkTeamCoreMax(team: TeamPlayerCircuitPoints[]): number {
    var maxPoints = 99999999;
    const maxPointsDict: { [key: string]: number } = {};
    const teamCountDict: { [key: string]: number } = {};
    team.forEach((player) => {
      if (player.prevTeamId != '0') {
        const currMaxPoints = maxPointsDict[player.prevTeamId] || 0;
        maxPointsDict[player.prevTeamId] = Math.max(currMaxPoints, player.points);
        const currCount: number = teamCountDict[player.prevTeamId] || 0;
        teamCountDict[player.prevTeamId] = currCount + 1;
      }
    });

    Object.entries(teamCountDict).forEach(([key, value]) => {
      if (value >= 3) {
        maxPoints = maxPointsDict[key];
      }
    });

    return maxPoints;
  }

  calculatePoints() {
    const playersThatCount = [...this.players.slice(0, 5)];
    const maxPointsPerPlayer = this.checkTeamCoreMax(playersThatCount);
    this.teamPoints = Math.min(
      playersThatCount.map((v) => v.points).reduce((accumulator, currentValue) => accumulator + currentValue, 0),
      5 * maxPointsPerPlayer
    );
  }

  placementLabel(): string {
    if (this.placement == 0) {
      return '1st';
    }
    if (this.placement == 1) {
      return '2nd';
    }
    if (this.placement == 2) {
      return '3rd';
    }
    if (this.placement == 3) {
      return '4th';
    }
    if (this.placement == 4 || this.placement == 5) {
      return '5/6';
    }
    if (this.placement == 6 || this.placement == 7) {
      return '7/8';
    }
    if (this.placement >= 8 && this.placement < 12) {
      return '9-12';
    }
    if (this.placement >= 12) {
      return '13-16';
    }
    return '';
  }

  backgroundColor() {
    if (this.players.length > 0) {
      if (this.players[0].place != 'TBD') {
        return '#bbbbbb';
      }
    }
    return 'white';
  }

  @Input()
  set roster(players: TeamPlayerCircuitPoints[]) {
    this.players = players;
    this.teamName = players[0].teamName;
    this.calculatePoints();
  }

  @Input()
  set place(idx: number) {
    this.placement = idx;
  }

  @Output() pointsUpdated = new EventEmitter<TeamPoints>();

  updatePoints() {
    this.pointsUpdated.emit({ teamName: this.teamName, points: this.teamPoints });
  }
}
