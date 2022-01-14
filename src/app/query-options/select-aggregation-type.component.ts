import { Component } from '@angular/core';
import { QueryService } from '../query.service';

@Component({
  selector: 'select-aggregation-type',
  templateUrl: './select-aggregation-type.component.html',
  styleUrls: ['../app.component.css'],
})
export class SelectAggregationTypeComponent {
  aggregationType: { label: string; value: string }[];
  constructor(private queryService: QueryService) {
    this.aggregationType = [
      { value: 'PLAYER', label: 'By Player' },
      { value: 'TEAM', label: 'By Team' },
      { value: 'HERO', label: 'By Hero' },
    ];
  }

  selectAggregationType(aggregationType: { label: string; value: string } = { value: 'PLAYER', label: 'By Player' }) {
    this.queryService.setAggregationType(aggregationType.value);
  }
}
