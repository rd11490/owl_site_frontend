import { Injectable } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { MetricType } from './win-rate-selectors/metric-selector.component';
import { WinRateRequest } from './models';

@Injectable({
  providedIn: 'root'
})
export class WinRateQueryParamsService {
  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  /**
   * Update URL with current filter state
   */
  updateUrlParams(params: WinRateRequest & { metric: MetricType }): void {
    const queryParams: Params = {
      startDate: params.dateRange.min,
      endDate: params.dateRange.max,
      regions: params.region?.join(','),
      ranks: params.rank?.join(','),
      maps: params.map?.join(','),
      heroes: params.hero?.join(','),
      metric: params.metric
    };

    // Remove undefined values
    Object.keys(queryParams).forEach(key => 
      queryParams[key] === undefined && delete queryParams[key]
    );

    this.router.navigate(
      [], 
      {
        relativeTo: this.route,
        queryParams,
        queryParamsHandling: 'merge'
      }
    );
  }

  /**
   * Parse URL parameters into filter state
   */
  parseUrlParams(params: Params): WinRateRequest & { metric: MetricType } {
    const defaultDateRange = this.getDefaultDateRange();

    return {
      dateRange: {
        min: params['startDate'] || defaultDateRange.min,
        max: params['endDate'] || defaultDateRange.max
      },
      region: params['regions']?.split(',').filter(Boolean),
      rank: params['ranks']?.split(',').filter(Boolean),
      map: params['maps']?.split(',').filter(Boolean),
      hero: params['heroes']?.split(',').filter(Boolean),
      metric: (params['metric'] as MetricType) || 'Win Rate'
    };
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
}
