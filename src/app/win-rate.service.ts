import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, firstValueFrom } from 'rxjs';
import { WinRateData, WinRateRequest } from './models';

@Injectable({
  providedIn: 'root',
})
export class WinRateService {
  private readonly API_BASE_URL = 'https://mb1m37u0ig.execute-api.us-east-1.amazonaws.com/dev';
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  loading$: Observable<boolean> = this.loadingSubject.asObservable();
  error$: Observable<string | null> = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {}

  async getWinRates(params: WinRateRequest): Promise<WinRateData[]> {
    try {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);

      const response = await firstValueFrom(
        this.http.post<WinRateData[]>(`${this.API_BASE_URL}/queryWinRates`, params).pipe(
          catchError((error: HttpErrorResponse) => {
            let errorMessage = 'An error occurred while fetching win rates.';

            if (error.error instanceof ErrorEvent) {
              // Client-side error
              errorMessage = error.error.message;
            } else {
              // Server-side error
              errorMessage =
                error.status === 0
                  ? 'Unable to connect to the server. Please check your internet connection.'
                  : `Error ${error.status}: ${error.error?.message || error.statusText}`;
            }

            this.errorSubject.next(errorMessage);
            throw new Error(errorMessage);
          }),
        ),
      );

      // Filter out invalid winRate values in each WinRateData
      return response.map((entry) => ({
        ...entry,
        data: entry.data.filter((d) => d.winRate >= 0 && d.winRate <= 100),
      }));
    } finally {
      this.loadingSubject.next(false);
    }
  }

  /**
   * Cache win rate data for better performance and reduced API calls
   */
  private cache = new Map<
    string,
    {
      data: WinRateData[];
      timestamp: number;
      params: WinRateRequest;
    }
  >();

  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async getCachedWinRates(params: WinRateRequest): Promise<WinRateData[]> {
    const cacheKey = this.createCacheKey(params);
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    const data = await this.getWinRates(params);
    // Also filter here for safety (in case getWinRates is bypassed)
    const filteredData = data.map((entry) => ({
      ...entry,
      data: entry.data.filter((d) => d.winRate >= 0 && d.winRate <= 100),
    }));
    this.cache.set(cacheKey, {
      data: filteredData,
      timestamp: Date.now(),
      params,
    });

    return filteredData;
  }

  private createCacheKey(params: WinRateRequest): string {
    return JSON.stringify({
      dateRange: params.dateRange,
      region: params.region?.sort(),
      map: params.map?.sort(),
      hero: params.hero?.sort(),
      rank: params.rank?.sort(),
    });
  }

  clearCache(): void {
    this.cache.clear();
  }
}
