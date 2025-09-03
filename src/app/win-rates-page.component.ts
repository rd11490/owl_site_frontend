import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { WinRateData, WinRateRequest } from './models';
import { WinRateService } from './win-rate.service';
import { WinRateQueryParamsService } from './win-rate-query-params.service';
import { MetricType } from './win-rate-selectors/metric-selector.component';
import { RankSelectorComponent } from './win-rate-selectors/rank-selector.component';
import { RegionSelectorComponent } from './win-rate-selectors/region-selector.component';
import { MapSelectorComponent } from './win-rate-selectors/map-selector.component';
import { HeroSelectorComponent } from './win-rate-selectors/hero-selector.component';
import { DateRangeSelectorComponent } from './win-rate-selectors/date-range-selector.component';
import { MetricSelectorComponent } from './win-rate-selectors/metric-selector.component';
import { WinRatePlotComponent } from './win-rate-selectors/win-rate-plot.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'win-rates-page',
  templateUrl: './win-rates-page.component.html',
  styleUrls: ['./win-rates-page.component.css']
})
export class WinRatesPageComponent implements OnInit, OnDestroy {
  winRates: WinRateData[] = [];
  selectedRegions: string[] = ['Americas'];
  selectedRanks: string[] = [
    'Bronze',
    'Silver',
    'Gold',
    'Platinum',
    'Diamond',
    'Master',
    'Grandmaster'
  ];
  selectedMaps: string[] = [];  // All maps
  selectedHeroes: string[] = ['Ana'];
  selectedMetric: MetricType = 'Win Rate';
  
  initialDateRange: { min: string; max: string } = {
    min: this.getDefaultDateRange().min,
    max: this.getDefaultDateRange().max
  };

  loading$ = this.winRateService.loading$;
  error$ = this.winRateService.error$;
  private destroy$ = new Subject<void>();

  constructor(
    private winRateService: WinRateService,
    private queryParamsService: WinRateQueryParamsService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Subscribe to query parameter changes
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const parsedParams = this.queryParamsService.parseUrlParams(params);
        
        // Update component state with defaults
        this.selectedRegions = parsedParams.region || ['Americas'];
        this.selectedRanks = parsedParams.rank || [
          'Bronze',
          'Silver',
          'Gold',
          'Platinum',
          'Diamond',
          'Master',
          'Grandmaster'
        ];
        this.selectedMaps = parsedParams.map || [];  // All maps
        this.selectedHeroes = parsedParams.hero || ['Ana'];
        this.selectedMetric = parsedParams.metric || 'Win Rate';
        this.initialDateRange = parsedParams.dateRange || this.getDefaultDateRange();

        // Update the filter text
        this.updateFilterText();

        // Load data
        this.loadWinRates(parsedParams);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getDefaultDateRange(): { min: string; max: string } {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    
    return {
      min: start.toISOString().split('T')[0],
      max: end.toISOString().split('T')[0]
    };
  }

  private async loadWinRates(params: WinRateRequest) {
    try {
      // Convert empty arrays to undefined
      const cleanedParams: WinRateRequest = {
        ...params,
        region: params.region?.length ? params.region : ['Americas'],
        rank: params.rank?.length ? params.rank : [
          'Bronze',
          'Silver',
          'Gold',
          'Platinum',
          'Diamond',
          'Master',
          'Grandmaster'
        ],
        map: params.map?.length ? params.map : undefined,  // All maps
        hero: params.hero?.length ? params.hero : ['Ana'],
      };

      // Update URL params
      this.queryParamsService.updateUrlParams({
        ...cleanedParams,
        metric: this.selectedMetric
      });

      // Load data with caching
      this.winRates = await this.winRateService.getCachedWinRates(cleanedParams);
    } catch (error) {
      console.error('Error loading win rates:', error);
      this.winRates = [];
    }
  }

  getLatestRate(data: WinRateData, type: 'win' | 'pick'): number {
    if (!data.data || data.data.length === 0) return 0;
    
    // Sort by date and get the most recent entry
    const sortedData = [...data.data].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    return type === 'win' ? sortedData[0].winRate : sortedData[0].pickRate;
  }

  onRegionsChange(regions: string[]) {
    this.selectedRegions = regions;
    this.updateFilterText();
  }

  onRanksChange(ranks: string[]) {
    this.selectedRanks = ranks;
    this.updateFilterText();
  }

  onMapsChange(maps: string[]) {
    this.selectedMaps = maps;
    this.updateFilterText();
  }

  onHeroesChange(heroes: string[]) {
    this.selectedHeroes = heroes;
    this.updateFilterText();
  }
  
  onDateRangeChange(dateRange: { min: string; max: string }) {
    this.initialDateRange = dateRange;
  }

  onMetricChange(metric: MetricType) {
    this.selectedMetric = metric;
    // Only metric change triggers immediate update
    this.search();
  }

  search() {
    this.loadWinRates({
      dateRange: this.initialDateRange,
      region: this.selectedRegions,
      rank: this.selectedRanks,
      map: this.selectedMaps,
      hero: this.selectedHeroes
    });
  }

  private filterText = 'Filter Options';

  private updateFilterText(): void {
    const parts: string[] = [];
    
    if (this.selectedHeroes?.length) {
      parts.push(`Heroes: ${this.selectedHeroes.join(', ')}`);
    }
    
    if (this.selectedMaps?.length) {
      parts.push(`Maps: ${this.selectedMaps.join(', ')}`);
    }
    
    if (this.selectedRanks?.length) {
      parts.push(`Ranks: ${this.selectedRanks.join(', ')}`);
    }
    
    if (this.selectedRegions?.length) {
      parts.push(`Regions: ${this.selectedRegions.join(', ')}`);
    }

    this.filterText = parts.join(' | ') || 'Filter Options';
  }

  getSelectedFiltersText(): string {
    return this.filterText;
  }
}
