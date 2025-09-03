import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { DataPoint } from '../models/plot.models';

@Injectable({
  providedIn: 'root'
})
export class D3UtilsService {
  
  /**
   * Creates a line generator for D3 line charts
   */
  createLineGenerator(xScale: d3.ScaleTime<number, number>, yScale: d3.ScaleLinear<number, number>) {
    return d3.line<DataPoint>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.value));
  }

  /**
   * Format a value as a percentage with one decimal place
   */
  formatValue(value: number): string {
    return d3.format('.1f')(value) + '%';
  }

  /**
   * Format a date as YYYY-MM-DD
   */
  formatDate(date: Date): string {
    return d3.timeFormat('%Y-%m-%d')(date);
  }

  /**
   * Debounce a function
   */
  debounce(func: () => void, wait: number) {
    let timeout: any;
    return () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(), wait);
    };
  }

  /**
   * Calculate Y axis domain with padding
   */
  calculateYDomain(values: number[]): [number, number] {
    const yExtent = d3.extent(values) as [number, number];
    const yRange = yExtent[1] - yExtent[0];
    const yPadding = yRange * 0.02;
    const yMin = Math.max(0, yExtent[0] - yPadding);
    const yMax = Math.min(100, yExtent[1] + yPadding);
    return [yMin, yMax];
  }
}
