import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { Scales, DataPoint } from '../models/plot.models';
import { ColorMappingService } from '../../services/color-mapping.service';
import { DataAnalyzerService } from '../data-analyzer.service';

@Injectable({
  providedIn: 'root',
})
export class ScaleService {
  private scales: Scales | null = null;

  constructor(
    private colorMappingService: ColorMappingService,
    private dataAnalyzerService: DataAnalyzerService,
  ) {}

  initializeScales(width: number, height: number, data: any[]): Scales {
    const colorCategory = data.length > 0 ? this.dataAnalyzerService.determineColorCategory(data) : 'hero';

    this.scales = {
      xScale: d3.scaleTime().range([0, width]),
      yScale: d3.scaleLinear().range([height, 0]),
      colorScale: (key: string) => this.generateUniqueColor(key),
      colorCategory: colorCategory,
    };

    return this.scales;
  }

  updateScales(scales: Scales, data: Map<string, DataPoint[]>) {
    // Find min/max dates and values across all series
    const allPoints = Array.from(data.values()).flat();

    // Calculate Y domain with 2% padding
    const yExtent = d3.extent(allPoints, (d) => d.value) as [number, number];
    const yRange = yExtent[1] - yExtent[0];
    const yPadding = yRange * 0.02;
    const yMin = Math.max(0, yExtent[0] - yPadding);
    const yMax = Math.min(100, yExtent[1] + yPadding);

    scales.xScale.domain(d3.extent(allPoints, (d) => d.date) as [Date, Date]);
    scales.yScale.domain([yMin, yMax]);
  }

  getLegendItems(data: Map<string, DataPoint[]>): { key: string; color: string }[] {
    const items = Array.from(data.keys()).map((key) => ({
      key,
      color: this.generateUniqueColor(key),
    }));

    return this.sortLegendItems(items);
  }

  private sortLegendItems(items: { key: string; color: string }[]): { key: string; color: string }[] {
    const rankOrder = ['grandmaster', 'master', 'diamond', 'platinum', 'gold', 'silver', 'bronze'];

    switch (this.scales?.colorCategory) {
      case 'rank':
        return items.sort((a, b) => {
          const rankA = this.extractRank(a.key).toLowerCase();
          const rankB = this.extractRank(b.key).toLowerCase();
          return rankOrder.indexOf(rankA) - rankOrder.indexOf(rankB);
        });
      case 'map':
        return items.sort((a, b) => {
          const mapA = this.extractMap(a.key);
          const mapB = this.extractMap(b.key);
          return mapA.localeCompare(mapB);
        });
      case 'hero':
      case 'region':
      default:
        return items.sort((a, b) => a.key.localeCompare(b.key));
    }
  }

  private extractRank(key: string): string {
    const parts = key.split('-');
    const allMapsIndex = parts.findIndex((p, i) => i < parts.length - 1 && p === 'all' && parts[i + 1] === 'maps');
    return allMapsIndex !== -1 ? parts[allMapsIndex + 2] : parts[2];
  }

  private extractMap(key: string): string {
    const parts = key.split('-');
    const allMapsIndex = parts.findIndex((p, i) => i < parts.length - 1 && p === 'all' && parts[i + 1] === 'maps');
    return allMapsIndex !== -1 ? 'all-maps' : parts[1];
  }

  private generateUniqueColor(key: string): string {
    if (!key) return '#808080';

    const parts = key.split('-');
    const hero = parts[0];
    let map, rank, region;

    const allMapsIndex = parts.findIndex((p, i) => i < parts.length - 1 && p === 'all' && parts[i + 1] === 'maps');
    if (allMapsIndex !== -1) {
      map = 'all-maps';
      rank = parts[allMapsIndex + 2];
      region = parts[allMapsIndex + 3];
    } else {
      map = parts[1];
      rank = parts[2];
      region = parts[3];
    }

    return this.getColorForCategory(hero, map, rank, region);
  }

  private getColorForCategory(hero: string, map: string, rank: string, region: string): string {
    switch (this.scales?.colorCategory) {
      case 'hero':
        return this.colorMappingService.getHeroColor(hero) || '#808080';
      case 'map':
        return this.colorMappingService.getMapColor(map) || '#808080';
      case 'rank':
        return this.colorMappingService.getRankColor(rank) || '#808080';
      case 'region':
        return this.colorMappingService.getRegionColor(region) || '#808080';
      default:
        return (
          this.colorMappingService.getHeroColor(hero) ||
          this.colorMappingService.getMapColor(map) ||
          this.colorMappingService.getRankColor(rank) ||
          this.colorMappingService.getRegionColor(region) ||
          '#808080'
        );
    }
  }
}
