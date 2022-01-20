import { Component, OnInit, ViewChild } from '@angular/core';
import { SetupService } from '../setup.service';
import { QueryService } from '../query.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'select-map-type',
  templateUrl: './select-map-type.component.html',
  styleUrls: ['../app.component.css'],
})
export class SelectMapTypeComponent implements OnInit {
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

  @ViewChild(NgSelectComponent, { static: false }) ngSelect!: NgSelectComponent;

  ngOnInit() {
    if (this.queryService.mapTypes) {
      // eslint-disable-next-line no-unused-vars
      this.setupService.constants.then((s) => {
        this.queryService.mapTypes.forEach((map) => {
          if (this.ngSelect.selectedItems.filter((v) => v.value == map).length < 1) {
            const mapType = s.mapTypes.find((h) => h == map);
            if (mapType) {
              this.ngSelect.select({
                name: [mapType],
                label: mapType,
                value: mapType,
              });
            }
          }
        });
      });
    }
  }

  selectMapTypes(mapTypes: Array<string>) {
    this.queryService.setMapTypes(mapTypes);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        mapTypes: mapTypes.length === 0 ? undefined : mapTypes.join(','),
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }
}
