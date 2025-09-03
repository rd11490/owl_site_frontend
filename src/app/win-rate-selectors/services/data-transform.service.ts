import { Injectable } from '@angular/core';
import { DataPoint, RawDataPoint } from '../models/plot.models';
import { WinRateData } from '../../models';
import { MetricType } from '../metric-selector.component';

@Injectable({
  providedIn: 'root'
})
export class DataTransformService {

  transformData(data: WinRateData[], metric: MetricType): Map<string, DataPoint[]> {
    const transformedData = new Map<string, DataPoint[]>();

    data.forEach(series => {
      const key = this.getSeriesKey(series);
      const points = series.data
        .map((point: RawDataPoint) => ({
          date: new Date(point.date),
          value: metric === 'Win Rate' ? point.winRate : point.pickRate,
          hero: series.hero,
          map: series.map,
          rank: series.rank,
          region: series.region
        }))
        .sort((a: DataPoint, b: DataPoint) => a.date.getTime() - b.date.getTime());

      transformedData.set(key, points);
    });

    return transformedData;
  }

  getSeriesKey(series: WinRateData): string {
    return `${series.hero}-${series.map}-${series.rank}-${series.region}`;
  }

  getDisplayLabel(point: DataPoint, allPoints: DataPoint[], colorCategory: 'hero' | 'map' | 'rank' | 'region'): string {
    // Find which values are common across all series
    const commonValues = {
      hero: allPoints.every(p => p.hero === point.hero),
      rank: allPoints.every(p => p.rank === point.rank),
      map: allPoints.every(p => p.map === point.map),
      region: allPoints.every(p => p.region === point.region)
    };

    const components: string[] = [];
    
    // Always add the category we're using for colors first, if it's not 'All'
    const colorValue = point[colorCategory];
    if (colorValue !== 'All') {
      components.push(colorValue);
    }

    // Then add other non-common, non-'All' values that aren't the color category
    if (!commonValues.hero && point.hero !== 'All' && colorCategory !== 'hero') {
      components.push(point.hero);
    }
    if (!commonValues.rank && point.rank !== 'All' && colorCategory !== 'rank') {
      components.push(point.rank);
    }
    if (!commonValues.map && point.map !== 'All' && colorCategory !== 'map') {
      components.push(point.map);
    }
    if (!commonValues.region && point.region !== 'All' && colorCategory !== 'region') {
      components.push(point.region);
    }

    // If we have no components, use the first non-'All' value
    if (components.length === 0) {
      if (point.hero !== 'All') return point.hero;
      if (point.rank !== 'All') return point.rank;
      if (point.map !== 'All') return point.map;
      if (point.region !== 'All') return point.region;
      return 'All'; // Fallback if everything is 'All'
    }

    return components.join(' - ');
  }

  findNearestPoint(mouseX: number, points: DataPoint[], xScale: d3.ScaleTime<number, number>): DataPoint {
    // Convert mouse position to date
    const mouseDate = xScale.invert(mouseX).getTime();
    
    // Sort points by date if not already sorted
    const sortedPoints = [...points].sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Find the last point that is to the left of the mouse
    for (let i = sortedPoints.length - 1; i >= 0; i--) {
      const currentPoint = sortedPoints[i];
      if (currentPoint.date.getTime() <= mouseDate) {
        return currentPoint;
      }
    }
    
    // If we're before the first point, return the first point
    return sortedPoints[0];
  }
}
