import { Component } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CircuitPointService } from '../circuitPoint.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TeamCircuitPoints, TeamPlayerCircuitPoints, TeamPoints } from '../models';

/**
 * @title Drag&Drop connected sorting
 */
@Component({
  selector: 'owcs-circuit-points-page',
  templateUrl: './owcs-circuit-points-page.component.html',
  styleUrls: ['../app.component.css', './owcs-circuit-points-page.css'],
})
export class OwcsCircuitPointsPageComponent {
  naTeamsCompeting: TeamCircuitPoints = {};
  naTeamsPlaced: TeamCircuitPoints = {};

  emeaTeamsCompeting: TeamCircuitPoints = {};
  emeaTeamsPlaced: TeamCircuitPoints = {};

  teams: TeamPlayerCircuitPoints[][] = [];
  finalStandings: TeamPoints[] = [];
  teamsAndPoints: { [key: string]: number } = {};

  currentRegion: string = 'North America';

  constructor(
    // eslint-disable-next-line no-unused-vars
    private circuitPointService: CircuitPointService,
    // eslint-disable-next-line no-unused-vars
    private route: ActivatedRoute,
    // eslint-disable-next-line no-unused-vars
    private router: Router
  ) {
    circuitPointService.getTeamCircuitPoints();
    circuitPointService.teamCircuitPoints.then((points) => {
      this.naTeamsCompeting = points.naTeams.competing;
      this.naTeamsPlaced = points.naTeams.placed;

      this.emeaTeamsCompeting = points.emeaTeams.competing;
      this.emeaTeamsPlaced = points.emeaTeams.placed;

      const keysCompeting = Object.keys(points.naTeams.competing);
      const keysPlaced = Object.keys(points.naTeams.placed);

      this.teams = [
        ...this.sortTeamsCompeting(keysCompeting.map((key) => points.naTeams.competing[key])),
        ...this.sortTeamsPlaced(keysPlaced.map((key) => points.naTeams.placed[key])),
      ];
      this.reset();
    });
  }

  reset() {
    this.teamsAndPoints = {};
    this.teams.forEach((team) => {
      this.teamsAndPoints[team[0].teamName] = this.calculateTeamTotal(team);
    });
    this.recalculatePoints();
  }

  swapToEMEA() {
    this.currentRegion = 'EMEA';
    const keysCompeting = Object.keys(this.emeaTeamsCompeting);
    const keysPlaced = Object.keys(this.emeaTeamsPlaced);

    this.teams = [
      ...this.sortTeamsCompeting(keysCompeting.map((key) => this.emeaTeamsCompeting[key])),
      ...this.sortTeamsPlaced(keysPlaced.map((key) => this.emeaTeamsPlaced[key])),
    ];
    this.reset();
  }

  swapToNA() {
    this.currentRegion = 'North America';
    const keysCompeting = Object.keys(this.naTeamsCompeting);
    const keysPlaced = Object.keys(this.naTeamsPlaced);

    this.teams = [
      ...this.sortTeamsCompeting(keysCompeting.map((key) => this.naTeamsCompeting[key])),
      ...this.sortTeamsPlaced(keysPlaced.map((key) => this.naTeamsPlaced[key])),
    ];
    this.reset();
  }

  isPlaced(players: TeamPlayerCircuitPoints[]): boolean {
    if (players.length > 0) {
      return players[0].place != 'TBD';
    }
    return false;
  }

  dropTeam(event: CdkDragDrop<TeamPlayerCircuitPoints[][]>) {
    if (event.currentIndex < 8) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      moveItemInArray(event.container.data, event.previousIndex, 7);
    }
    this.recalculatePoints();
  }

  sortTeamsCompeting(teams: TeamPlayerCircuitPoints[][]): TeamPlayerCircuitPoints[][] {
    return teams.sort((left, right) => this.calculateTeamTotal(right) - this.calculateTeamTotal(left));
  }

  sortTeamsPlaced(teams: TeamPlayerCircuitPoints[][]): TeamPlayerCircuitPoints[][] {
    return teams.sort((left, right) => this.compareTeamsBasedOnPlace(right) - this.compareTeamsBasedOnPlace(left));
  }

  compareTeamsBasedOnPlace(team: TeamPlayerCircuitPoints[]): number {
    if (team[0].place == '1') {
      return 8;
    }
    if (team[0].place == '2') {
      return 7;
    }
    if (team[0].place == '3') {
      return 6;
    }
    if (team[0].place == '4') {
      return 5;
    }
    if (team[0].place == '5-6') {
      return 4;
    }
    if (team[0].place == '7-8') {
      return 3;
    }
    if (team[0].place == '9-12') {
      return 2;
    }
    if (team[0].place == '13-16') {
      return 1;
    }
    return 0;
  }

  calculateTeamTotal(team: TeamPlayerCircuitPoints[]): number {
    const top5 = [...team.slice(0, 5)];
    return top5.reduce((acc, player) => {
      return acc + player.points;
    }, 0);
  }

  updateTeamPoints(teamPoints: TeamPoints) {
    this.teamsAndPoints[teamPoints.teamName] = teamPoints.points;
    this.recalculatePoints();
  }

  additionalPoints(idx: number): number {
    if (idx == 0) {
      return 500;
    }
    if (idx == 1) {
      return 400;
    }
    if (idx == 2) {
      return 300;
    }
    if (idx == 3) {
      return 250;
    }
    if (idx == 4 || idx == 5) {
      return 200;
    }
    if (idx == 6 || idx == 7) {
      return 150;
    }
    if (idx > 7 && idx <= 11) {
      return 100;
    }
    if (idx >= 12) {
      return 50;
    }
    return 0;
  }

  recalculatePoints() {
    const teamsWithAdditionalPoints = this.teams.map((team, index) => {
      const teamName = team[0].teamName;
      return { teamName: teamName, points: this.teamsAndPoints[teamName] + this.additionalPoints(index) };
    });
    const [winner, ...theRest] = teamsWithAdditionalPoints;
    const sorted = [...theRest.sort((left, right) => right.points - left.points)];
    this.finalStandings = [winner, ...sorted];
  }
}
