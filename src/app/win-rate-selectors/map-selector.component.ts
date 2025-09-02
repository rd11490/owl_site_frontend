import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { transformMapName } from '../utils/map-name-transformer';

@Component({
  selector: 'map-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
  ],
  template: `
    <div class="map-selector">
      <mat-form-field appearance="fill">
        <mat-label>Map</mat-label>
        <mat-select [formControl]="mapControl" multiple>
          <mat-option (click)="toggleAll()">All</mat-option>
          <mat-select-trigger>
            {{getSelectedMapDisplay()}}
          </mat-select-trigger>
          <mat-option *ngFor="let map of mapOptions" [value]="map">
            {{transformMapName(map)}}
          </mat-option>
        </mat-select>
      </mat-form-field>
    </div>
  `,
  styles: [`
    .map-selector {
      min-width: 200px;
    }
  `]
})
export class MapSelectorComponent {
  @Input() selectedMaps: string[] = [];
  @Output() mapsChange = new EventEmitter<string[]>();

  mapControl = new FormControl<string[]>([]);
  
  readonly mapOptions = [
    'ilios',
    'oasis',
    'lijiang-tower',
    'nepal',
    'busan',
    'eichenwalde',
    'kings-row',
    'midtown',
    'route-66',
    'circuit-royal',
    'dorado',
    'watchpoint-gibraltar',
    'hollywood',
    'numbani',
    'havana',
    'junkertown',
    'paraiso',
    'colosseo',
    'esperanca',
    'new-queen-street'
  ];

  constructor() {
    this.mapControl.valueChanges.subscribe(values => {
      this.mapsChange.emit(values || []);
    });
  }

  toggleAll() {
    if (this.mapControl.value?.length === this.mapOptions.length) {
      this.mapControl.setValue([]);
    } else {
      this.mapControl.setValue([...this.mapOptions]);
    }
  }

  transformMapName(name: string): string {
    return transformMapName(name);
  }

  getSelectedMapDisplay(): string {
    const selected = this.mapControl.value || [];
    if (selected.length === 0) return 'All Maps';
    if (selected.length === 1) return this.transformMapName(selected[0]);
    return `${selected.length} maps selected`;
  }
}
