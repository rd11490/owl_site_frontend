import { Component, EventEmitter, Input, Output, ViewChild, AfterViewInit } from '@angular/core';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'rank-selector',
  template: `
    <div class="rank-selector">
      <ng-select
        [items]="rankOptions"
        [multiple]="true"
        placeholder="Rank"
        [virtualScroll]="true"
        (change)="onRankChange($event)">
      </ng-select>
    </div>
  `,
  styles: [`
    .rank-selector {
      min-width: 200px;
    }
  `]
})
export class RankSelectorComponent implements AfterViewInit {
  @Input() selectedRanks: string[] = [];
  @Output() ranksChange = new EventEmitter<string[]>();
  @ViewChild(NgSelectComponent, { static: false }) ngSelect!: NgSelectComponent;
  
  readonly rankOptions = [
    'All',
    'Grandmaster',
    'Master',
    'Diamond',
    'Platinum',
    'Gold',
    'Silver',
    'Bronze'
  ];

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.selectedRanks?.length > 0) {
        this.selectedRanks.forEach(rank => {
          if (this.ngSelect?.selectedItems?.filter(v => v.value === rank).length < 1) {
            this.ngSelect.select({
              name: rank,
              label: rank,
              value: rank
            });
          }
        });
      }
    });
  }

  onRankChange(selectedRanks: string[]) {
    this.ranksChange.emit(selectedRanks || []);
  }
}
