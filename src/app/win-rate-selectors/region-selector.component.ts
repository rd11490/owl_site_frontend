import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'region-selector',
  template: `
    <div class="region-selector">
      <ng-select
        [items]="regions"
        [multiple]="true"
        [closeOnSelect]="false"
        bindLabel="name"
        bindValue="id"
        placeholder="Region"
        [virtualScroll]="true"
        (change)="onRegionChange($event)"
        [(ngModel)]="selectedRegions"
      >
      </ng-select>
    </div>
  `,
  styles: [
    `
      .region-selector {
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
export class RegionSelectorComponent {
  @Input() selectedRegions: string[] = [];
  @Output() regionsChange = new EventEmitter<string[]>();
  @ViewChild(NgSelectComponent, { static: false }) ngSelect!: NgSelectComponent;

  readonly regionOptions = ['Americas', 'Asia', 'Europe'];

  readonly regions = [
    { id: 'Americas', name: 'Americas' },
    { id: 'Asia', name: 'Asia' },
    { id: 'Europe', name: 'Europe' },
  ];

  onRegionChange(event: any) {
    this.regionsChange.emit(event?.map((item: any) => item.id) || []);
  }
}
