import { Injectable } from '@angular/core';
import { WinRateData } from '../models';

export type ColorCategory = 'hero' | 'map' | 'rank' | 'region';

@Injectable({
  providedIn: 'root',
})
export class DataAnalyzerService {
  /**
   * Analyzes win rate data to determine which category has the most unique values
   */
  determineColorCategory(data: WinRateData[]): ColorCategory {
    const uniqueCounts = {
      hero: new Set(data.map((d) => d.hero)).size,
      map: new Set(data.map((d) => d.map)).size,
      rank: new Set(data.map((d) => d.rank)).size,
      region: new Set(data.map((d) => d.region)).size,
    };

    let maxCategory: ColorCategory = 'hero';
    let maxCount = uniqueCounts.hero;

    (Object.entries(uniqueCounts) as [ColorCategory, number][]).forEach(([category, count]) => {
      if (count > maxCount) {
        maxCategory = category;
        maxCount = count;
      }
    });

    return maxCategory;
  }
}
