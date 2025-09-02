import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

export type MetricType = 'Win Rate' | 'Pick Rate';

@Component({
  selector: 'metric-selector',
  styleUrls: ['../app.component.css'],
  template: `
    <div class="metric-selector">
      <mat-form-field appearance="fill">
        <mat-label>Metric</mat-label>
        <mat-select [formControl]="metricControl">
          <mat-option *ngFor="let metric of metrics" [value]="metric">
            {{metric}}
          </mat-option>
        </mat-select>
      </mat-form-field>
    </div>
  `,
  styles: [`
    .metric-selector {
      min-width: 120px;
    }
  `]
})
export class MetricSelectorComponent {
  @Input() set selectedMetric(value: MetricType) {
    this.metricControl.setValue(value, { emitEvent: false });
  }
  @Output() metricChange = new EventEmitter<MetricType>();

  metricControl = new FormControl<MetricType>('Win Rate');
  
  readonly metrics: MetricType[] = ['Win Rate', 'Pick Rate'];

  constructor() {
    this.metricControl.valueChanges.subscribe(value => {
      if (value) {
        this.metricChange.emit(value);
      }
    });
  }
}
