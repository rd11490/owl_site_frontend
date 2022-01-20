import { Component } from '@angular/core';
import { SetupService } from '../setup.service';
import { QueryService } from '../query.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'select-hero',
  templateUrl: './select-hero.component.html',
  styleUrls: ['../app.component.css'],
})
export class SelectHeroComponent {
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

  selectHeroes(heroes: Array<string>) {
    this.queryService.setHeroes(heroes);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        heroes: heroes,
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }
}
