import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { NgSelectComponent } from '@ng-select/ng-select';
import { transformMapName } from '../utils/map-name-transformer';

@Component({
  selector: 'map-selector',
  template: `
    <div class="map-selector">
      <ng-select
        [items]="groupedMaps"
        [multiple]="true"
        [closeOnSelect]="false"
        [groupBy]="'group'"
        bindLabel="name"
        bindValue="id"
        placeholder="Map"
        [virtualScroll]="true"
        (change)="onMapChange($event)"
        [(ngModel)]="selectedMaps"
      >
      </ng-select>
    </div>
  `,
  styles: [
    `
      .map-selector {
        min-width: 200px;
      }
      ::ng-deep .ng-select .ng-select-container {
        min-height: 36px;
      }
      ::ng-deep .ng-select.ng-select-multiple .ng-select-container .ng-value-container .ng-value {
        background-color: #e0e0e0;
        border-radius: 4px;
        margin: 2px;
        padding: 2px 8px;
      }
    `,
  ],
})
export class MapSelectorComponent {
  @Input() selectedMaps: string[] = [];
  @ViewChild(NgSelectComponent, { static: false }) ngSelect!: NgSelectComponent;

  readonly controlMaps = ['busan', 'ilios', 'lijang-tower', 'nepal', 'oasis', 'samoa'];

  readonly escortMaps = [
    'circuit-royal',
    'dorado',
    'havana',
    'junkertown',
    'rialto',
    'route-66',
    'shambali-monastery',
    'watchpoint-gibraltar',
  ];

  readonly hybridMaps = ['blizzard-world', 'eichenwalde', 'hollywood', 'kings-row', 'midtown', 'numbani', 'paraiso'];

  readonly pushMaps = ['colosseo', 'esperanca', 'new-queen-street'];

  readonly flashpointMaps = ['suravasa', 'new-junk-city', 'aatlis'];

  @Output() mapsChange = new EventEmitter<string[]>();

  readonly groupedMaps = [
    ...this.controlMaps.map((map) => ({ id: map, name: transformMapName(map), group: 'Control' })),
    ...this.escortMaps.map((map) => ({ id: map, name: transformMapName(map), group: 'Escort' })),
    ...this.hybridMaps.map((map) => ({ id: map, name: transformMapName(map), group: 'Hybrid' })),
    ...this.pushMaps.map((map) => ({ id: map, name: transformMapName(map), group: 'Push' })),
    ...this.flashpointMaps.map((map) => ({ id: map, name: transformMapName(map), group: 'Flashpoint' })),
  ];

  onMapChange(event: any) {
    this.mapsChange.emit(event?.map((item: any) => item.id) || []);
  }
}
