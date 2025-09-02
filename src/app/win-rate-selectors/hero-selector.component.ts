import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { SetupService } from '../setup.service';

@Component({
  selector: 'hero-selector',
  // No longer standalone - using module imports
  template: `
    <div class="hero-selector">
      <mat-form-field appearance="fill">
        <mat-label>Hero</mat-label>
        <mat-select [formControl]="heroControl" multiple>
          <mat-option (click)="toggleAll()">All</mat-option>
          <mat-select-trigger>
            {{getSelectedHeroDisplay()}}
          </mat-select-trigger>
          <mat-option *ngFor="let hero of heroes" [value]="hero">
            {{hero}}
          </mat-option>
        </mat-select>
      </mat-form-field>
    </div>
  `,
  styles: [`
    .hero-selector {
      min-width: 200px;
    }
  `]
})
export class HeroSelectorComponent implements OnInit {
  @Input() selectedHeroes: string[] = [];
  @Output() heroesChange = new EventEmitter<string[]>();

  heroControl = new FormControl<string[]>([]);
  heroes: string[] = [];

  constructor(private setupService: SetupService) {}

  async ngOnInit() {
    // Get heroes from setup service
    const setup = await this.setupService.constants;
    this.heroes = setup.heroes.sort();
    
    // Set initial value if provided
    if (this.selectedHeroes.length > 0) {
      this.heroControl.setValue(this.selectedHeroes);
    }

    // Subscribe to changes
    this.heroControl.valueChanges.subscribe(values => {
      this.heroesChange.emit(values || []);
    });
  }

  toggleAll() {
    if (this.heroControl.value?.length === this.heroes.length) {
      this.heroControl.setValue([]);
    } else {
      this.heroControl.setValue([...this.heroes]);
    }
  }

  getSelectedHeroDisplay(): string {
    const selected = this.heroControl.value || [];
    if (selected.length === 0) return 'All Heroes';
    if (selected.length === 1) return selected[0];
    return `${selected.length} heroes selected`;
  }
}
