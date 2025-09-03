import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';

export type MetricType = 'Win Rate' | 'Pick Rate';

@Component({
  selector: 'metric-selector',
  styleUrls: ['../app.component.css'],
  template: `
    <div class="metric-selector">
      <mat-radio-group 
        [formControl]="metricControl"
        class="metric-radio-group"
        aria-label="Select metric">
        <mat-radio-button 
          *ngFor="let metric of metrics" 
          [value]="metric"
          class="metric-radio-button">
          {{metric}}
        </mat-radio-button>
      </mat-radio-group>
    </div>
  `,
  styles: [`
    .metric-selector {
      display: flex;
      justify-content: center;
      padding: 4px;
    }
    .metric-radio-group {
      display: flex;
      gap: 20px;
      margin: 0;
      height: 32px;
      align-items: center;
    }
    .metric-radio-button {
      color: #444;
      margin: 0;
      height: 32px;
      display: flex;
      align-items: center;
    }
    ::ng-deep .mat-radio-button {
      &.mat-accent {
        .mat-radio-inner-circle {
          background-color: #000 !important;
        }
        
        .mat-radio-outer-circle {
          border-color: #000 !important;
        }

        .mat-radio-ripple .mat-ripple-element {
          background-color: rgba(0, 0, 0, 0.1) !important;
        }

        &.mat-radio-checked .mat-radio-persistent-ripple {
          background-color: rgba(0, 0, 0, 0.1) !important;
        }

        .mat-radio-container:hover .mat-radio-persistent-ripple {
          background-color: rgba(0, 0, 0, 0.04) !important;
        }

        &.cdk-focused .mat-radio-persistent-ripple {
          background-color: rgba(0, 0, 0, 0.1) !important;
        }

        &.cdk-keyboard-focused .mat-radio-persistent-ripple {
          background-color: rgba(0, 0, 0, 0.1) !important;
        }

        &.cdk-program-focused {
          box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1) !important;
        }

        .mat-ripple-element {
          background-color: rgba(0, 0, 0, 0.1) !important;
        }
      }

      /* General states */
      .mat-radio-ripple .mat-ripple-element {
        background-color: rgba(0, 0, 0, 0.1) !important;
      }

      &:not(.mat-radio-checked) .mat-radio-outer-circle {
        border-color: #000 !important;
      }

      &.cdk-keyboard-focused .mat-radio-outer-circle {
        border-color: #000 !important;
      }
    }

    /* Ensure focus overlay is also black */
    ::ng-deep .mat-radio-button .mat-focus-indicator::before {
      background-color: rgba(0, 0, 0, 0.1) !important;
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
