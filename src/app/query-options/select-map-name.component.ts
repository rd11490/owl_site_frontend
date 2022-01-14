import { Component } from '@angular/core';
import { SetupService } from '../setup.service';
import { map, Observable } from 'rxjs';
import { QueryService } from '../query.service';

@Component({
  selector: 'select-map-name',
  templateUrl: './select-map-name.component.html',
  styleUrls: ['../app.component.css'],
})
export class SelectMapNameComponent {
  mapNames: Promise<string[]>;
  constructor(private setupService: SetupService, private queryService: QueryService) {
    this.mapNames = setupService.constants.then((setup) => setup.mapNames.sort());
  }

  selectMapNames(mapNames: Array<string>) {
    this.queryService.setMapNames(mapNames);
  }
}
