import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

@Component({
  selector: 'region-selector',
  // No longer standalone - using module imports
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
