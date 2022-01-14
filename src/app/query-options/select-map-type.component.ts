import { Component } from '@angular/core';
import { SetupService } from '../setup.service';
import { map, Observable } from 'rxjs';
import { QueryService } from '../query.service';

@Component({
  selector: 'select-map-type',
  templateUrl: './select-map-type.component.html',
  styleUrls: ['../app.component.css'],
})
export class SelectMapTypeComponent {
  mapTypes: Promise<string[]>;
  constructor(private setupService: SetupService, private queryService: QueryService) {
    this.mapTypes = setupService.constants.then((setup) => setup.mapTypes.sort());
  }

  selectMapTypes(mapTypes: Array<string>) {
    this.queryService.setMapTypes(mapTypes);
  }
}
