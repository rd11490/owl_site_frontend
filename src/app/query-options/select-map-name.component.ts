import { Component, OnInit, ViewChild } from '@angular/core';
import { SetupService } from '../setup.service';
import { QueryService } from '../query.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'select-map-name',
  templateUrl: './select-map-name.component.html',
  styleUrls: ['../app.component.css'],
})
export class SelectMapNameComponent implements OnInit {
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

  @ViewChild(NgSelectComponent, { static: false }) ngSelect!: NgSelectComponent;

  ngOnInit() {
    if (this.queryService.mapNames) {
      // eslint-disable-next-line no-unused-vars
      this.setupService.constants.then((s) => {
        this.queryService.mapNames.forEach((map) => {
          if (this.ngSelect.selectedItems.filter((v) => v.value == map).length < 1) {
            const mapName = s.mapNames.find((h) => h == map);
            if (mapName) {
              this.ngSelect.select({
                name: [mapName],
                label: mapName,
                value: mapName,
              });
            }
          }
        });
      });
    }
  }

  selectMapNames(mapNames: Array<string>) {
    this.queryService.setMapNames(mapNames);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        mapNames: mapNames.length === 0 ? undefined : mapNames.join(','),
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }
}
