import { Component } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { CircuitPointService } from '../circuitPoint.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PlayerCircuitPoints } from '../models';

/**
 * @title Drag&Drop connected sorting
 */
@Component({
  selector: 'roster-mania-page',
  templateUrl: './roster-mania-page.component.html',
  styleUrls: ['../app.component.css', './roster-mania-page.css'],
})
export class RosterManiaPageComponent {
  naPoints: PlayerCircuitPoints[] = [];
  emeaPoints: PlayerCircuitPoints[] = [];
  points: PlayerCircuitPoints[] = [];
  team1: PlayerCircuitPoints[] = [];
  team2: PlayerCircuitPoints[] = [];
  team3: PlayerCircuitPoints[] = [];
  team4: PlayerCircuitPoints[] = [];

  team1Points = 0;
  team2Points = 0;
  team3Points = 0;
  team4Points = 0;

  filteredPoints: PlayerCircuitPoints[] = [];
  filterText: string = '';
  addPlayerName: string = '';

  currentRegion: string = 'North America';

  constructor(
    // eslint-disable-next-line no-unused-vars
    private circuitPointService: CircuitPointService,
    // eslint-disable-next-line no-unused-vars
    private route: ActivatedRoute,
    // eslint-disable-next-line no-unused-vars
    private router: Router
  ) {
    circuitPointService.getCircuitPoints();
    circuitPointService.playerCircuitPoints.then((points) => {
      this.naPoints = this.sortPlayerPoints(points.naPoints);
      this.emeaPoints = this.sortPlayerPoints(points.emeaPoints);
      this.points = [...this.naPoints];
      this.filteredPoints = [...this.naPoints];
    });
  }

  sortPlayerPoints(playerPoints: PlayerCircuitPoints[]): PlayerCircuitPoints[] {
    const out = playerPoints.sort((left, right) => {
      if (left.points !== right.points) {
        return right.points - left.points;
      }
      if (left.role[0] !== right.role[0]) {
        return left.role[0].localeCompare(right.role[0]);
      }
      return left.ign.localeCompare(right.ign);
    });
    return [...out];
  }

  resetEMEA() {
    this.points = [...this.emeaPoints];
    this.filteredPoints = [...this.emeaPoints];
  }

  resetNA() {
    this.points = [...this.naPoints];
    this.filteredPoints = [...this.naPoints];
  }

  swapToEMEA() {
    this.currentRegion = 'EMEA';
    this.reset();
  }

  swapToNA() {
    this.currentRegion = 'North America';
    this.reset();
  }

  filterItems() {
    this.filteredPoints = this.points.filter((iteam) => {
      return (
        iteam.ign.toLowerCase().includes(this.filterText.toLowerCase()) ||
        iteam.teamName.toLowerCase().includes(this.filterText.toLowerCase())
      );
    });
  }

  addPlayer() {
    if (this.addPlayerName !== '') {
      const newPlayer = {
        teamId: Math.random().toString(10),
        teamName: 'No Team',
        playerId: Math.random().toString(10),
        ign: this.addPlayerName,
        role: ['Tank', 'Damage', 'Support'],
        points: 0,
      };
      if (this.currentRegion == 'North America') {
        this.naPoints = this.sortPlayerPoints(this.naPoints.concat([newPlayer]));
        this.points = [...this.naPoints];
      } else {
        this.emeaPoints = this.sortPlayerPoints(this.emeaPoints.concat([newPlayer]));
        this.points = [...this.emeaPoints];
      }
      this.filterItems();
      this.addPlayerName = '';
    }
  }

  dropPlayers(event: CdkDragDrop<PlayerCircuitPoints[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }
    this.filteredPoints = this.sortPlayerPoints(this.filteredPoints);
    this.recalculatePoints();
  }

  dropTeam(event: CdkDragDrop<PlayerCircuitPoints[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }
    this.recalculatePoints();
  }

  checkTeamCoreMax(team: PlayerCircuitPoints[]): number {
    var maxPoints = 99999999;
    const maxPointsDict: { [key: string]: number } = {};
    const teamCountDict: { [key: string]: number } = {};
    team.forEach((player) => {
      const currMaxPoints = maxPointsDict[player.teamId] || 0;
      maxPointsDict[player.teamId] = Math.max(currMaxPoints, player.points);
      const currCount: number = teamCountDict[player.teamId] || 0;
      teamCountDict[player.teamId] = currCount + 1;
    });

    Object.entries(teamCountDict).forEach(([key, value]) => {
      if (value >= 3) {
        maxPoints = maxPointsDict[key];
      }
    });

    return maxPoints;
  }

  calculatePoints(team: PlayerCircuitPoints[]): number {
    const playersThatCount = team.slice(0, 5);
    const maxPointsPerPlayer = this.checkTeamCoreMax(playersThatCount);
    return Math.min(
      playersThatCount.map((v) => v.points).reduce((accumulator, currentValue) => accumulator + currentValue, 0),
      5 * maxPointsPerPlayer
    );
  }

  recalculatePoints() {
    this.team1Points = this.calculatePoints(this.team1);
    this.team2Points = this.calculatePoints(this.team2);
    this.team3Points = this.calculatePoints(this.team3);
    this.team4Points = this.calculatePoints(this.team4);
  }

  reset() {
    if (this.currentRegion == 'North America') {
      this.resetNA();
    } else {
      this.resetEMEA();
    }
    this.team1Points = 0;
    this.team2Points = 0;
    this.team3Points = 0;
    this.team4Points = 0;

    this.team1 = [];
    this.team2 = [];
    this.team3 = [];
    this.team4 = [];
  }
}
