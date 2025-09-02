import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { QueryService } from '../query.service';
import { SelectAggregationTypeComponent } from './select-aggregation-type.component';
import { SelectPlayerComponent } from './select-player.component';
import { SelectHeroComponent } from './select-hero.component';
import { SelectTeamComponent } from './select-team.component';
import { SelectOpponentTeamComponent } from './select-opponent-team.component';
import { SelectCompositionComponent } from './select-composition.component';
import { SelectOpponentCompositionComponent } from './select-opponent-composition.component';
import { SelectMapTypeComponent } from './select-map-type.component';
import { SelectMapNameComponent } from './select-map-name.component';
import { SelectStageComponent } from './select-stage.component';

@Component({
  selector: 'selector',
  templateUrl: './selector.component.html',
  styleUrls: ['../app.component.css'],
})
export class SelectorComponent {
  constructor(private queryService: QueryService) {}

  selectionText() {
    return this.queryService.selectionText();
  }
}
