import { Component } from '@angular/core';
import { SetupService } from '../setup.service';
import { QueryService } from '../query.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'select-map-name',
  templateUrl: './select-map-name.component.html',
  styleUrls: ['../app.component.css'],
})
export class SelectMapNameComponent {
  mapNames: Promise<string[]>;
  constructor(
    private setupService: SetupService,
    // eslint-disable-next-line no-unused-vars
    private queryService: QueryService,
    // eslint-disable-next-line no-unused-vars
    private route: ActivatedRoute,
    // eslint-disable-next-line no-unused-vars
    private router: Router
  ) {
    this.mapNames = setupService.constants.then((setup) => setup.mapNames.sort());
  }

  selectMapNames(mapNames: Array<string>) {
    this.queryService.setMapNames(mapNames);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        mapNames: mapNames,
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }
}
