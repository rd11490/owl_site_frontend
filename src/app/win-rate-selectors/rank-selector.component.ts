import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule, NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'rank-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule
  ],
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
export class RankSelectorComponent {
  @Input() selectedRanks: string[] = [];
  @Output() ranksChange = new EventEmitter<string[]>();
  @ViewChild(NgSelectComponent, { static: false }) ngSelect!: NgSelectComponent;
  
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
    if (this.selectedRanks?.length > 0) {
      this.selectedRanks.forEach(rank => {
        if (this.ngSelect.selectedItems.filter(v => v.value === rank).length < 1) {
          this.ngSelect.select({
            name: rank,
            label: rank,
            value: rank
          });
        }
      });
    }
  }

  onRankChange(selectedRanks: string[]) {
    this.ranksChange.emit(selectedRanks || []);
  }
}
