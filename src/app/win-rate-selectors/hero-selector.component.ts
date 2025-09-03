import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { NgSelectComponent } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'hero-selector',
  template: `
    <div class="hero-selector">
      <ng-select
        [items]="groupedHeroes"
        [multiple]="true"
        [closeOnSelect]="false"
        [groupBy]="'group'"
        bindLabel="name"
        bindValue="id"
        placeholder="Hero"
        [virtualScroll]="true"
        (change)="onHeroChange($event)"
        [(ngModel)]="selectedHeroes">
      </ng-select>
    </div>
  `,
  styles: [`
    .hero-selector {
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
  `]
})
export class HeroSelectorComponent {
  @Input() selectedHeroes: string[] = [];
  @ViewChild(NgSelectComponent, { static: false }) ngSelect!: NgSelectComponent;
  @Output() heroesChange = new EventEmitter<string[]>();

  readonly supportHeroes = [
    'Ana',
    'Baptiste',
    'Brigitte',
    'Illari',
    'Juno',
    'Kiriko',
    'Lifeweaver',
    'Lúcio',
    'Mercy',
    'Moira',
    'Wuyang',
    'Zenyatta'
  ];

  readonly tankHeroes = [
    'D.Va',
    'Doomfist',
    'Hazard',
    'Junker Queen',
    'Mauga',
    'Orisa',
    'Ramattra',
    'Reinhardt',
    'Roadhog',
    'Sigma',
    'Winston',
    'Wrecking Ball',
    'Zarya'
  ];

  readonly dpsHeroes = [
    'Ashe',
    'Bastion',
    'Cassidy',
    'Echo',
    'Freja',
    'Genji',
    'Hanzo',
    'Junkrat',
    'Mei',
    'Pharah',
    'Reaper',
    'Sojourn',
    'Soldier: 76',
    'Sombra',
    'Symmetra',
    'Torbjörn',
    'Tracer',
    'Venture',
    'Widowmaker'
  ];

  readonly groupedHeroes = [
    ...this.supportHeroes.map(hero => ({ id: hero, name: hero, group: 'Support' })),
    ...this.tankHeroes.map(hero => ({ id: hero, name: hero, group: 'Tank' })),
    ...this.dpsHeroes.map(hero => ({ id: hero, name: hero, group: 'Damage' }))
  ];

  onHeroChange(event: any[]) {
    this.heroesChange.emit(event?.map(item => item.id) || []);
  }
}
