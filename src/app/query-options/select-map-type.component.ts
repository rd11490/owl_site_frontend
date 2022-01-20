import { Component } from '@angular/core';
import { SetupService } from '../setup.service';
import { QueryService } from '../query.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'select-map-type',
  templateUrl: './select-map-type.component.html',
  styleUrls: ['../app.component.css'],
})
export class SelectMapTypeComponent {
  mapTypes: Promise<string[]>;
  constructor(
    private setupService: SetupService,
    // eslint-disable-next-line no-unused-vars
    private queryService: QueryService,
    // eslint-disable-next-line no-unused-vars
    private route: ActivatedRoute,
    // eslint-disable-next-line no-unused-vars
    private router: Router
  ) {
    this.mapTypes = setupService.constants.then((setup) => setup.mapTypes.sort());
  }

  selectMapTypes(mapTypes: Array<string>) {
    this.queryService.setMapTypes(mapTypes);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        mapTypes: mapTypes,
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }
}
