import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FaceitRoster, FaceitRosterResponse, initialFaceitRosterResponse } from '../models';
import { RosterService } from '../roster.service';
import { MatTableDataSource } from '@angular/material/table';

/**
 * @title Drag&Drop connected sorting
 */
@Component({
  selector: 'roster-page',
  templateUrl: './roster-page.component.html',
  styleUrls: ['../app.component.css', './roster-page.css'],
})
export class RosterPageComponent {
  rosterResponse: FaceitRosterResponse = initialFaceitRosterResponse;
  faceitEvents: string[] = [];
  rosters: FaceitRoster[] = [];
  filteredRosters: FaceitRoster[] = [];
  filterText: string = '';

  currentRegion: string = 'North America';

  dataSource: MatTableDataSource<FaceitRoster> = new MatTableDataSource<FaceitRoster>(this.filteredRosters);

  columnsToDisplay: string[] = [
    'teamName',
    'playerIgn0',
    'playerIgn1',
    'playerIgn2',
    'playerIgn3',
    'playerIgn4',
    'playerIgn5',
    'playerIgn6',
    'playerIgn7',
    'coachIgn0',
  ];

  constructor(
    // eslint-disable-next-line no-unused-vars
    private rosterService: RosterService,
    // eslint-disable-next-line no-unused-vars
    private route: ActivatedRoute,
    // eslint-disable-next-line no-unused-vars
    private router: Router
  ) {
    rosterService.getRosters();
    rosterService.constants.then((rosterResponse) => {
      this.rosterResponse = rosterResponse;
      this.faceitEvents = Object.keys(rosterResponse).sort();
      const firstKey = Object.keys(rosterResponse)[0];
      this.currentRegion = firstKey;
      this.rosters = this.sortRosters([...rosterResponse[firstKey]]);
      this.filteredRosters = this.sortRosters([...rosterResponse[firstKey]]);
      this.updateDataSource();
    });
  }

  updateDataSource() {
    this.dataSource = new MatTableDataSource<FaceitRoster>(this.filteredRosters);
  }

  sortRosters(rosters: FaceitRoster[]): FaceitRoster[] {
    console.log(rosters);
    const out = rosters.sort((left, right) => {
      if (left.teamSize !== right.teamSize) {
        return right.teamSize - left.teamSize;
      }
      return left.teamName.localeCompare(right.teamName);
    });
    return [...out];
  }

  selectFaceitEvent(event: string) {
    this.rosters = this.sortRosters([...this.rosterResponse[event]]);
    this.filteredRosters = this.sortRosters([...this.rosterResponse[event]]);
    this.currentRegion = event;
    this.filterItems();
    this.updateDataSource();
  }

  filterItems() {
    this.filteredRosters = this.rosters.filter((iteam) => {
      return (
        iteam.teamName.toLowerCase().includes(this.filterText.toLowerCase()) ||
        iteam.playerIgn0.toLowerCase().includes(this.filterText.toLowerCase()) ||
        iteam.playerIgn1.toLowerCase().includes(this.filterText.toLowerCase()) ||
        iteam.playerIgn2.toLowerCase().includes(this.filterText.toLowerCase()) ||
        iteam.playerIgn3.toLowerCase().includes(this.filterText.toLowerCase()) ||
        iteam.playerIgn4.toLowerCase().includes(this.filterText.toLowerCase()) ||
        iteam.playerIgn5.toLowerCase().includes(this.filterText.toLowerCase()) ||
        iteam.playerIgn6.toLowerCase().includes(this.filterText.toLowerCase()) ||
        iteam.playerIgn7.toLowerCase().includes(this.filterText.toLowerCase()) ||
        iteam.coachIgn0.toLowerCase().includes(this.filterText.toLowerCase())
      );
    });
    this.updateDataSource();
  }
}
