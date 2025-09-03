import { Component, OnInit, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, combineLatest } from 'rxjs';
import { map, takeUntil, distinctUntilChanged } from 'rxjs/operators';
import { WinRateService } from './win-rate.service';
import { WinRateQueryParamsService } from './win-rate-query-params.service';
import { WinRateData } from './models';
import { MetricType } from './win-rate-selectors/metric-selector.component';

@Component({
  selector: 'win-rate-page',
  template: `
    <div class="win-rate-page">
      <div class="selectors-container">
        <div class="selector-row">
          <rank-selector [rank]="rank$ | async" (rankChange)="onRankChange($event)"></rank-selector>
          <region-selector [region]="region$ | async" (regionChange)="onRegionChange($event)"></region-selector>
        </div>
        <div class="selector-row">
          <map-selector [map]="map$ | async" (mapChange)="onMapChange($event)"></map-selector>
          <hero-selector [hero]="hero$ | async" (heroChange)="onHeroChange($event)"></hero-selector>
        </div>
        <div class="selector-row">
          <date-range-selector
            [startDate]="startDate$ | async"
            [endDate]="endDate$ | async"
            (dateRangeChange)="onDateRangeChange($event)"
          >
          </date-range-selector>
          <metric-selector [metric]="metric$ | async" (metricChange)="onMetricChange($event)"></metric-selector>
        </div>
      </div>

      <div class="plot-container" [class.loading]="loading$ | async">
        <win-rate-plot *ngIf="!(loading$ | async)" [data]="data$ | async" [metric]="metric$ | async"> </win-rate-plot>
        <mat-spinner *ngIf="loading$ | async"></mat-spinner>
      </div>

      <div class="error-message" *ngIf="error$ | async as error">
        {{ error }}
      </div>
    </div>
  `,
  styles: [
    `
      .win-rate-page {
        padding: 20px;
        height: 100%;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .selectors-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .selector-row {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
      }

      .plot-container {
        flex: 1;
        min-height: 850px;
        position: relative;
        border: 1px solid #ddd;
        border-radius: 8px;
        background: white;
      }

      .plot-container.loading {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .error-message {
        color: #d32f2f;
        padding: 16px;
        border-radius: 4px;
        background-color: #fde7e7;
        margin-top: 16px;
      }
    `,
  ],
})
export class WinRatePageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Selector state
  rank$ = new BehaviorSubject<string>('');
  region$ = new BehaviorSubject<string>('');
  map$ = new BehaviorSubject<string>('');
  hero$ = new BehaviorSubject<string>('');
  startDate$ = new BehaviorSubject<Date | null>(null);
  endDate$ = new BehaviorSubject<Date | null>(null);
  metric$ = new BehaviorSubject<MetricType>('Win Rate');

  // Data state
  data$ = new BehaviorSubject<WinRateData[]>([]);
  loading$ = new BehaviorSubject<boolean>(false);
  error$ = new BehaviorSubject<string | null>(null);

  constructor(
    private winRateService: WinRateService,
    private queryParamsService: WinRateQueryParamsService,
  ) {}

  ngOnInit() {
    // Subscribe to query parameter changes
    this.queryParamsService.queryParams$.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.rank$.next(params.rank || '');
      this.region$.next(params.region || '');
      this.map$.next(params.map || '');
      this.hero$.next(params.hero || '');
      this.startDate$.next(params.startDate ? new Date(params.startDate) : null);
      this.endDate$.next(params.endDate ? new Date(params.endDate) : null);
      this.metric$.next(params.metric || 'Win Rate');
    });

    // Subscribe to selector changes to trigger data fetch
    combineLatest([this.rank$, this.region$, this.map$, this.hero$, this.startDate$, this.endDate$])
      .pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        map(([rank, region, map, hero, startDate, endDate]) => ({
          rank,
          region,
          map,
          hero,
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
        })),
      )
      .subscribe((params) => {
        this.fetchData(params);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onRankChange(rank: string) {
    this.queryParamsService.updateParams({ rank });
  }

  onRegionChange(region: string) {
    this.queryParamsService.updateParams({ region });
  }

  onMapChange(map: string) {
    this.queryParamsService.updateParams({ map });
  }

  onHeroChange(hero: string) {
    this.queryParamsService.updateParams({ hero });
  }

  onDateRangeChange({ startDate, endDate }: { startDate: Date; endDate: Date }) {
    this.queryParamsService.updateParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  }

  onMetricChange(metric: MetricType) {
    this.queryParamsService.updateParams({ metric });
  }

  private fetchData(params: any) {
    if (!this.isValidParams(params)) {
      return;
    }

    this.loading$.next(true);
    this.error$.next(null);

    this.winRateService
      .getWinRates(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.data$.next(data);
          this.loading$.next(false);
        },
        error: (error) => {
          console.error('Error fetching win rates:', error);
          this.error$.next('Failed to load win rate data. Please try again.');
          this.loading$.next(false);
        },
      });
  }

  private isValidParams(params: any): boolean {
    return Boolean(params.rank && params.region && params.startDate && params.endDate);
  }
}
