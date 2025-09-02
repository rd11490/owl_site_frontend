import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'region-selector',
  template: `
    <div class="region-selector">
      <mat-form-field appearance="fill">
        <mat-label>Region</mat-label>
        <mat-select [formControl]="regionControl" multiple>
          <mat-option (click)="toggleAll()">All</mat-option>
          <mat-option *ngFor="let region of regionOptions" [value]="region">
            {{region}}
          </mat-option>
        </mat-select>
      </mat-form-field>
    </div>
  `,
  styles: [`
    .region-selector {
      min-width: 200px;
    }
  `]
})
export class RegionSelectorComponent {
  @Input() selectedRegions: string[] = [];
  @Output() regionsChange = new EventEmitter<string[]>();

  regionControl = new FormControl<string[]>(['Americas']);
  
  readonly regionOptions = [
    'Americas',
    'Asia',
    'Europe'
  ];

  constructor() {
    this.regionControl.valueChanges.subscribe(values => {
      this.regionsChange.emit(values || []);
    });
  }

  toggleAll() {
    if (this.regionControl.value?.length === this.regionOptions.length) {
      this.regionControl.setValue([]);
    } else {
      this.regionControl.setValue([...this.regionOptions]);
    }
  }
}
