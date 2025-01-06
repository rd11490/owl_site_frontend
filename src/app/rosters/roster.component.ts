import { Component, Input } from '@angular/core';
import { FaceitRoster } from '../models';

@Component({
  selector: 'roster',
  templateUrl: './roster.component.html',
  styleUrls: ['../app.component.css', './roster-page.css', './roster.css'],
})
export class RosterComponent {
  rosterInfo: FaceitRoster | undefined;

  @Input()
  set roster(rosterInfo: FaceitRoster) {
    this.rosterInfo = rosterInfo;
  }
}
