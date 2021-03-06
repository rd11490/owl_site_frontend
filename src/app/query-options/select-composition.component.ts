import { Component, OnInit, ViewChild } from '@angular/core';
import { SetupService } from '../setup.service';
import { QueryService } from '../query.service';
import { Composition } from '../models';
import { ActivatedRoute, Router } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'select-composition',
  templateUrl: './select-composition.component.html',
  styleUrls: ['../app.component.css'],
})
export class SelectCompositionComponent implements OnInit {
  compositions: Promise<Composition[]>;

  constructor(
    private setupService: SetupService,
    // eslint-disable-next-line no-unused-vars
    private queryService: QueryService,
    // eslint-disable-next-line no-unused-vars
    private route: ActivatedRoute,
    // eslint-disable-next-line no-unused-vars
    private router: Router
  ) {
    this.compositions = setupService.constants.then((setup) =>
      setup.comps.sort((a, b) => (a.label > b.label ? 1 : -1))
    );
  }

  @ViewChild(NgSelectComponent, { static: false }) ngSelect!: NgSelectComponent;

  ngOnInit() {
    if (this.queryService.composition) {
      // eslint-disable-next-line no-unused-vars
      this.setupService.constants.then((s) => {
        this.queryService.composition.forEach((comp) => {
          if (this.ngSelect.selectedItems.filter((v) => v.value == comp.cluster).length < 1) {
            const compToSelect = s.comps.find((cs) => cs.cluster == comp.cluster);
            if (compToSelect) {
              this.ngSelect.select({
                cluster: compToSelect.cluster,
                label: compToSelect.label,
                value: compToSelect,
              });
            }
          }
        });
      });
    }
  }

  selectComposition(composition: Composition[]) {
    this.queryService.setCompsition(composition);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        composition: composition.length === 0 ? undefined : composition.map((c) => c.cluster).join(','),
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }
}
