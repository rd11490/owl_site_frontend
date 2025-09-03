import { Component, EventEmitter, Input, Output, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

interface DateRange {
  min: string;
  max: string;
}

@Component({
  selector: 'date-range-selector',
  templateUrl: './date-range-selector.component.html',
  styleUrls: ['./date-range-selector.component.css'],
  encapsulation: ViewEncapsulation.None
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
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
