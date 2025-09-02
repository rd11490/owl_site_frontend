import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

interface DateRange {
  min: string;
  max: string;
}

@Component({
  selector: 'date-range-selector',
  // No longer standalone - using module imports
  template: `
    <div class="date-range-selector">
      <mat-form-field appearance="fill">
        <mat-label>Date Range</mat-label>
        <mat-date-range-input [formGroup]="dateRange" [rangePicker]="picker" [max]="maxDate">
          <input matStartDate 
                 formControlName="start" 
                 placeholder="Start date">
          <input matEndDate 
                 formControlName="end" 
                 placeholder="End date">
        </mat-date-range-input>
        <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
        <mat-date-range-picker #picker></mat-date-range-picker>
        <mat-error *ngIf="dateRange.controls.start.hasError('matStartDateInvalid')">Invalid start date</mat-error>
        <mat-error *ngIf="dateRange.controls.end.hasError('matEndDateInvalid')">Invalid end date</mat-error>
      </mat-form-field>

      <div class="quick-select">
        <mat-button-toggle-group>
          <mat-button-toggle (click)="setLastDays(7)">7 Days</mat-button-toggle>
          <mat-button-toggle (click)="setLastDays(30)">30 Days</mat-button-toggle>
          <mat-button-toggle (click)="setLastDays(90)">90 Days</mat-button-toggle>
        </mat-button-toggle-group>
      </div>
    </div>
  `,
  styles: [`
    .date-range-selector {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .date-range-selector mat-form-field {
      min-width: 240px;
    }
    .quick-select {
      display: flex;
      justify-content: center;
    }
    .quick-select mat-button-toggle-group {
      border-radius: 4px;
    }
    .quick-select mat-button-toggle {
      font-size: 12px;
    }
  `]
})
export class DateRangeSelectorComponent implements OnInit {
  @Input() initialRange?: DateRange;
  @Output() dateRangeChange = new EventEmitter<DateRange>();

  dateRange = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  maxDate = new Date();

  ngOnInit() {
    // Set default range to last 30 days if no initial range provided
    if (!this.initialRange) {
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      this.dateRange.setValue({
        start: thirtyDaysAgo,
        end: today
      });
    } else {
      this.dateRange.setValue({
        start: new Date(this.initialRange.min),
        end: new Date(this.initialRange.max)
      });
    }

    // Subscribe to value changes
    this.dateRange.valueChanges.subscribe(range => {
      if (range.start && range.end) {
        this.dateRangeChange.emit({
          min: this.formatDate(range.start),
          max: this.formatDate(range.end)
        });
      }
    });
  }

  setLastDays(days: number) {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    
    this.dateRange.setValue({
      start,
      end
    });
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
