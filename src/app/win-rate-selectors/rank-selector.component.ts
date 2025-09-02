import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

@Component({
  selector: 'rank-selector',
  // No longer standalone - using module imports
  template: `
    <div class="rank-selector">
      <mat-form-field appearance="fill">
        <mat-label>Rank</mat-label>
        <mat-select [formControl]="rankControl" multiple>
          <mat-option (click)="toggleAll()">All</mat-option>
          <mat-option *ngFor="let rank of rankOptions" [value]="rank">
            {{rank}}
          </mat-option>
        </mat-select>
      </mat-form-field>
    </div>
  `,
  styles: [`
    .rank-selector {
      min-width: 200px;
    }
  `]
})
export class RankSelectorComponent {
  @Input() selectedRanks: string[] = [];
  @Output() ranksChange = new EventEmitter<string[]>();

  rankControl = new FormControl<string[]>([]);
  
  readonly rankOptions = [
    'Bronze',
    'Silver',
    'Gold',
    'Platinum',
    'Diamond',
    'Master',
    'Grandmaster'
  ];

  ngOnInit() {
    // Set initial value
    this.rankControl.setValue(this.selectedRanks || []);
  
    // Subscribe to value changes
    this.rankControl.valueChanges.subscribe(values => {
      if (values !== null) {
        this.ranksChange.emit(values);
      }
    });
  }

  toggleAll() {
    if (this.rankControl.value?.length === this.rankOptions.length) {
      this.rankControl.setValue([]);
    } else {
      this.rankControl.setValue([...this.rankOptions]);
    }
  }
}
