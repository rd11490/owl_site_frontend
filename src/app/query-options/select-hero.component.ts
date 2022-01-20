import { Component, OnInit, ViewChild } from '@angular/core';
import { SetupService } from '../setup.service';
import { QueryService } from '../query.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'select-hero',
  templateUrl: './select-hero.component.html',
  styleUrls: ['../app.component.css'],
})
export class SelectHeroComponent implements OnInit {
  heroes: Promise<string[]>;
  // eslint-disable no-unused-vars
  constructor(
    private setupService: SetupService,
    // eslint-disable-next-line no-unused-vars
    private queryService: QueryService,
    // eslint-disable-next-line no-unused-vars
    private route: ActivatedRoute,
    // eslint-disable-next-line no-unused-vars
    private router: Router
  ) {
    this.heroes = setupService.constants.then((setup) => setup.heroes.sort());
  }

  @ViewChild(NgSelectComponent, { static: false }) ngSelect!: NgSelectComponent;

  ngOnInit() {
    if (this.queryService.heroes) {
      // eslint-disable-next-line no-unused-vars
      this.setupService.constants.then((s) => {
        this.queryService.heroes.forEach((hero) => {
          if (this.ngSelect.selectedItems.filter((v) => v.value == hero).length < 1) {
            const heroToSelect = s.heroes.find((h) => h == hero);
            if (heroToSelect) {
              this.ngSelect.select({
                name: [heroToSelect],
                label: heroToSelect,
                value: heroToSelect,
              });
            }
          }
        });
      });
    }
  }

  selectHeroes(heroes: Array<string>) {
    this.queryService.setHeroes(heroes);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        heroes: heroes.length === 0 ? undefined : heroes.join(','),
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }
}
