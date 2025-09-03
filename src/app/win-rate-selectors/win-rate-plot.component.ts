import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';
import { WinRateData } from '../models';
import { MetricType } from './metric-selector.component';
import { ColorMappingService } from '../services/color-mapping.service';
import { DataAnalyzerService } from './data-analyzer.service';

type D3Selection = d3.Selection<any, unknown, null, undefined>;
type D3Event = d3.D3DragEvent<any, any, any> | MouseEvent;

interface RawDataPoint {
  date: string;
  winRate: number;
  pickRate: number;
}

interface DataPoint {
  date: Date;
  value: number;
  hero: string;
  map: string;
  rank: string;
  region: string;
}

interface Scales {
  xScale: d3.ScaleTime<number, number>;
  yScale: d3.ScaleLinear<number, number>;
  colorScale: (key: string) => string;
  colorCategory: 'hero' | 'map' | 'rank' | 'region'; // Track which category is being used for colors
}

type LabelData = {
  key: string;
  lastPoint: DataPoint;
  label: string;
  x: number;
  y: number;
};

@Component({
  selector: 'win-rate-plot',
  template: `
    <div class="win-rate-plot-container" #container>
      <svg #svg></svg>
      <div #tooltip class="tooltip"></div>
    </div>
  `,
  styles: [`
    .win-rate-plot-container {
      position: relative;
      width: 100%;
      height: 800px;
      margin: 0;
      padding: 0;
      background: white;
      overflow: visible; /* Allow content to extend beyond container */
    }
    svg {
      width: 100%;
      height: 100%;
      cursor: move;  /* Indicate pannable */
      background: white !important; /* Force white background */
      display: block; /* Removes extra space at bottom */
      overflow: visible; /* Allow content to extend beyond SVG */
    }
    .chart-background {
      fill: white;
    }
    .main-group {
      background: white;
    }
    .zoom-area {
      cursor: move;
      fill: white;
      pointer-events: all;
    }
    .plot-background {
      fill: white;
    }
    .x-axis text, .y-axis text {
      fill: black;
      font-size: 10px;
    }
    .x-axis text {
      text-anchor: end;
      transform: rotate(-45deg) translate(-10px, 0);
    }
    .x-axis path, .y-axis path, .x-axis line, .y-axis line {
      stroke: black;
    }
    .x-axis, .y-axis {
      background: white;
    }

    .line {
      transition: opacity 0.2s ease;
    }
    .line.dimmed {
      opacity: 0.2;
    }
    .line-label {
      pointer-events: none;
      font-family: Arial, sans-serif;
      text-shadow: -1px -1px 3px white, 
                   -1px 1px 3px white, 
                   1px -1px 3px white, 
                   1px 1px 3px white;
    }
    .line-label.dimmed {
      opacity: 0.2;
    }
    .label-connector {
      pointer-events: none;
      stroke-dasharray: 2,2;
    }
    .label-connector.dimmed {
      opacity: 0.1;
    }
    .tooltip {
      position: absolute;
      pointer-events: none;
      background: rgba(255, 255, 255, 0.95);
      padding: 10px 14px;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      font-size: 12px;
      z-index: 1000;
      transition: opacity 0.2s ease;
      border-radius: 6px;
      border: 1px solid #ddd;
      font-size: 13px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 2;
      transition: opacity 0.15s ease;
    }
  `]
})
export class WinRatePlotComponent implements OnInit, OnDestroy, AfterViewInit {
  constructor(
    private colorMappingService: ColorMappingService,
    private dataAnalyzerService: DataAnalyzerService
  ) {}
  @ViewChild('container') containerRef!: ElementRef;
  @ViewChild('svg') svgRef!: ElementRef;
  @ViewChild('tooltip') tooltipRef!: ElementRef;

  @Input() set data(value: WinRateData[]) {
    this._data = value;
    if (this.initialized) {
      this.updatePlot();
    }
  }
  
  @Input() set metric(value: MetricType) {
    this._metric = value;
    if (this.initialized) {
      this.updatePlot();
    }
  }

  private _data: WinRateData[] = [];
  private _metric: MetricType = 'Win Rate';
  private initialized = false;
  private resizeObserver: ResizeObserver | null = null;

  // D3 selections
  private svg!: D3Selection;
  private mainGroup!: D3Selection;
  private xAxis!: D3Selection;
  private yAxis!: D3Selection;
  private tooltip!: D3Selection;
  private scales: Scales | null = null;

  // Chart dimensions
  private margin = { top: 20, right: 80, bottom: 50, left: 60 };
  private width = 0;
  private height = 0;

  private readonly legendItemWidth = 200;
  private readonly legendItemHeight = 20;

  ngOnInit() {
    // Set up resize observer
    this.resizeObserver = new ResizeObserver(this.debounce(() => {
      this.updateDimensions();
      this.updatePlot();
    }, 100));

    if (this.containerRef?.nativeElement) {
      this.resizeObserver.observe(this.containerRef.nativeElement);
    }
  }

  ngAfterViewInit() {
    this.initialized = false;
    // First update dimensions
    this.updateDimensions();
    // Then initialize the plot with the correct dimensions
    this.initializePlot();
    this.initialized = true;
    if (this._data) {
      this.updatePlot();
    }
  }

  ngOnDestroy() {
    // Clean up resources
    this.resizeObserver?.disconnect();
    this.tooltip?.remove();
  }

  private updateDimensions() {
    if (!this.containerRef?.nativeElement) return;

    // Get the container dimensions
    const containerRect = this.containerRef.nativeElement.getBoundingClientRect();
    const baseHeight = 800; // Base height for the main plot area
    
    // Set dimensions accounting for margins
    this.width = containerRect.width - this.margin.left - this.margin.right;
    this.height = baseHeight - this.margin.top - this.margin.bottom;

    // Update SVG dimensions to match container
    if (this.svg) {
      this.svg
        .attr('width', containerRect.width)
        .attr('height', baseHeight);
    }

    // Update mainGroup transform if it exists
    if (this.mainGroup) {
      this.mainGroup.attr('transform', `translate(${this.margin.left},${this.margin.top})`);
    }

    // Update scales if they exist
    if (this.scales) {
      this.scales.xScale.range([0, this.width]);
      this.scales.yScale.range([this.height, 0]);
    }
  }

  private initializePlot() {
    if (!this.svgRef?.nativeElement || !this.tooltipRef?.nativeElement) return;

    // Create main SVG
    this.svg = d3.select(this.svgRef.nativeElement);

    // Create main group
    this.mainGroup = this.svg.append('g')
      .attr('class', 'main-group');

    // Add white background
    this.mainGroup.append('rect')
      .attr('class', 'plot-background')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', 'white');
    
    // Add background for x-axis area
    this.mainGroup.append('rect')
      .attr('class', 'axis-background')
      .attr('x', 0)
      .attr('y', this.height)
      .attr('width', this.width)
      .attr('height', this.margin.bottom)
      .attr('fill', 'white');

    // Create axes
    this.xAxis = this.mainGroup.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${this.height})`);

    this.yAxis = this.mainGroup.append('g')
      .attr('class', 'y-axis');

    // Create tooltip
    this.tooltip = d3.select(this.tooltipRef?.nativeElement)
      .style('opacity', 0);

    // Initialize scales
    this.initializeScales();
  }

  private generateUniqueColor(key: string): string {
    if (!key) return '#808080'; // Default gray for undefined keys

    // Parse the key which is in format "hero-map-rank-region"
    const parts = key.split('-');
    const hero = parts[0];
    let map, rank, region;

    // Find the index of "all-maps" if it exists
    const allMapsIndex = parts.findIndex((p, i) => i < parts.length - 1 && p === 'all' && parts[i + 1] === 'maps');
    if (allMapsIndex !== -1) {
      map = 'all-maps';
      rank = parts[allMapsIndex + 2]; // Skip over "maps"
      region = parts[allMapsIndex + 3];
    } else {
      // If we don't find "all-maps", assume standard format
      map = parts[1];
      rank = parts[2];
      region = parts[3];
    }
    
    console.log(`Color lookup for key: ${key}`);
    console.log(`Parsed values: hero=${hero}, map=${map}, rank=${rank}, region=${region}`);
    console.log(`Current color category: ${this.scales?.colorCategory}`);

    // Get the relevant color based on the current color category
    let color;
    switch (this.scales?.colorCategory) {
      case 'hero':
        color = this.colorMappingService.getHeroColor(hero);
        console.log(`Hero color for ${hero}: ${color}`);
        return color || '#808080';
      case 'map':
        color = this.colorMappingService.getMapColor(map);
        console.log(`Map color for ${map}: ${color}`);
        return color || '#808080';
      case 'rank':
        color = this.colorMappingService.getRankColor(rank);
        console.log(`Rank color for ${rank}: ${color}`);
        return color || '#808080';
      case 'region':
        color = this.colorMappingService.getRegionColor(region);
        console.log(`Region color for ${region}: ${color}`);
        return color || '#808080';
      default:
        // If no category is set, try to use the most specific color available
        let finalColor = this.colorMappingService.getHeroColor(hero) || 
                        this.colorMappingService.getMapColor(map) || 
                        this.colorMappingService.getRankColor(rank) || 
                        this.colorMappingService.getRegionColor(region) || 
                        '#808080';
        console.log(`Using fallback color: ${finalColor}`);
        return finalColor;
    }
  }

  private initializeScales() {
    // Determine which category has the most unique values to use for coloring
    const colorCategory = this._data.length > 0 ? 
      this.dataAnalyzerService.determineColorCategory(this._data) : 'hero';

    this.scales = {
      xScale: d3.scaleTime().range([0, this.width]),
      yScale: d3.scaleLinear().range([this.height, 0]),
      colorScale: (key: string) => this.generateUniqueColor(key),
      colorCategory: colorCategory
    };
  }

  private transformData(): Map<string, DataPoint[]> {
    const transformedData = new Map<string, DataPoint[]>();

    this._data.forEach(series => {
      const key = this.getSeriesKey(series);
      const points = series.data.map((point: RawDataPoint) => ({
        date: new Date(point.date),
        value: this._metric === 'Win Rate' ? point.winRate : point.pickRate,
        hero: series.hero,
        map: series.map,
        rank: series.rank,
        region: series.region
      })).sort((a: DataPoint, b: DataPoint) => a.date.getTime() - b.date.getTime());

      transformedData.set(key, points);
    });

    return transformedData;
  }

  private getSeriesKey(series: WinRateData): string {
    return `${series.hero}-${series.map}-${series.rank}-${series.region}`;
  }

  private getDisplayLabel(point: DataPoint, allPoints: DataPoint[]): string {
    if (!this.scales) return '';

    // Find which values are common across all series
    const commonValues = {
      hero: allPoints.every(p => p.hero === point.hero),
      rank: allPoints.every(p => p.rank === point.rank),
      map: allPoints.every(p => p.map === point.map),
      region: allPoints.every(p => p.region === point.region)
    };

    const components: string[] = [];
    
    // Always add the category we're using for colors first, if it's not 'All'
    const colorCategory = this.scales.colorCategory;
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

  private updatePlot() {
    if (!this._data || !this.scales) return;

    // Transform data for plotting
    const data = this.transformData();

    // Find min/max dates and values across all series
    const allDataPoints = Array.from(data.values()).flat();
    if (allDataPoints.length === 0) return;

    // Update scales
    this.updateScales(data);

    // Update axes
    this.updateAxes();

    // Create line generator
    const line = d3.line<DataPoint>()
      .x(d => this.scales!.xScale(d.date))
      .y(d => this.scales!.yScale(d.value));

    // Get or create lines group
    const linesGroup = this.mainGroup.selectAll<SVGGElement, unknown>('.lines-group')
      .data([null])
      .join('g')
      .attr('class', 'lines-group');

    // Create the lines
    const lines = linesGroup.selectAll<SVGPathElement, [string, DataPoint[]]>('.line')
      .data(Array.from(data.entries()));

    // Exit
    lines.exit()
      .transition()
      .duration(300)
      .style('opacity', 0)
      .remove();

    // Enter
    const linesEnter = lines.enter()
      .append('path')
      .attr('class', d => `line line-${d[0].replace(/[^a-zA-Z0-9]/g, '-')}`)
      .attr('fill', 'none')
      .attr('stroke-width', '2px')
      .style('opacity', 0)
      .attr('clip-path', 'url(#plot-area)');

    // Update + Enter
    // Update lines
    lines.merge(linesEnter)
      .attr('stroke', d => {
        if (!this.scales) return '#808080';
        return this.generateUniqueColor(d[0]); // Use the series key to generate color
      })
      .transition()
      .duration(500)
      .style('opacity', 1)
      .attr('d', d => line(d[1]));

    // Add or update line labels
    const labelData: LabelData[] = Array.from(data.entries())
      .filter(([_, points]) => points.length > 0)
      .map(([key, points]) => {
        const lastPoint = points[points.length - 1];
        // Position labels to the right of each line's end point
        const xOffset = 10; // Space between line end and label
        if (!this.scales) {
          return {
            key,
            lastPoint,
            label: this.getDisplayLabel(lastPoint, allDataPoints),
            x: 0,
            y: 0
          };
        }
        return {
          key,
          lastPoint,
          label: this.getDisplayLabel(lastPoint, allDataPoints),
          x: this.scales.xScale(lastPoint.date) + xOffset,
          y: this.scales.yScale(lastPoint.value)
        };
      });

    // Update labels
    const labelSelection = this.mainGroup.selectAll<SVGTextElement, LabelData>('.line-label')
      .data(labelData);

    // Remove old labels
    labelSelection.exit().remove();

    // Add new labels
    const labelSelectionEnter = labelSelection.enter()
      .append('text')
      .attr('class', d => `line-label line-label-${d.key.replace(/[^a-zA-Z0-9]/g, '-')}`)
      .attr('text-anchor', 'start')
      .attr('alignment-baseline', 'middle')
      .style('font-size', '12px'); // Add explicit font size

    // Update + Enter
    labelSelection.merge(labelSelectionEnter)
      .text(d => d.label)
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('opacity', 1);

    // Add or update connectors
    const connectorSelection = this.mainGroup.selectAll<SVGPathElement, LabelData>('.label-connector')
      .data(labelData);

    // Remove old connectors
    connectorSelection.exit().remove();

    // Add new connectors
    const connectorSelectionEnter = connectorSelection.enter()
      .append('path')
      .attr('class', d => `label-connector label-connector-${d.key.replace(/[^a-zA-Z0-9]/g, '-')}`)
      .attr('fill', 'none')
      .attr('stroke', '#666')
      .style('opacity', 0.5)
      .style('stroke-dasharray', '2,2') // Add dashed line
      .style('pointer-events', 'none');

    // Update connector positions
    connectorSelection.merge(connectorSelectionEnter)
      .attr('d', d => {
        if (!this.scales) return '';
        const lineEndX = this.scales.xScale(d.lastPoint.date);
        const lineEndY = this.scales.yScale(d.lastPoint.value);
        return `M ${lineEndX} ${lineEndY} L ${d.x} ${d.y}`;
      });

    // Add events
    const that = this;
    this.mainGroup.selectAll<SVGPathElement, [string, DataPoint[]]>('.line')
      .on('mouseover', (event: MouseEvent, d: [string, DataPoint[]]) => {
        that.highlightSeries(d[0]);
      })
      .on('mousemove', (event: MouseEvent, d: [string, DataPoint[]]) => {
        const points = d[1];
        if (points.length > 0) {
          const nearestPoint = that.findNearestPoint(event, points);
          that.showTooltip(event, nearestPoint);
        }
        that.moveTooltip(event);
      })
      .on('mouseout', (event: MouseEvent, d: [string, DataPoint[]]) => {
        that.unhighlightSeries(d[0]);
        that.hideTooltip();
      });
  }

  private updateScales(data: Map<string, DataPoint[]>) {
    if (!this.scales) return;

    // Find min/max dates and values across all series
    const allPoints = Array.from(data.values()).flat();
    
    // Calculate Y domain with 2% padding
    const yExtent = d3.extent(allPoints, d => d.value) as [number, number];
    const yRange = yExtent[1] - yExtent[0];
    const yPadding = yRange * 0.02;
    const yMin = Math.max(0, yExtent[0] - yPadding); // Don't go below 0 for percentages
    const yMax = Math.min(100, yExtent[1] + yPadding); // Don't exceed 100 for percentages
    
    this.scales.xScale.domain(d3.extent(allPoints, d => d.date) as [Date, Date]);
    this.scales.yScale.domain([yMin, yMax]);
  }

  private updateAxes() {
    if (!this.scales) return;

    // Update X axis
    this.xAxis
      .transition()
      .duration(300)
      .call(d3.axisBottom(this.scales.xScale));

    // Update Y axis
    this.yAxis
      .transition()
      .duration(300)
      .call(d3.axisLeft(this.scales.yScale).ticks(10));

    // Add Y axis label
    this.yAxis.selectAll('.y-axis-label').remove();
    this.yAxis
      .append('text')
      .attr('class', 'y-axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('x', -this.height / 2)
      .attr('y', -this.margin.left + 20)
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', 'black')
      .text(this._metric === 'Win Rate' ? 'Win Rate (%)' : 'Pick Rate (%)');
  }

  private highlightSeries(key: string) {
    if (!this.mainGroup || !this.scales) return;

    // Dim all lines except the one matching the exact key
    this.mainGroup.selectAll<SVGPathElement, [string, DataPoint[]]>('.line')
      .style('opacity', d => d[0] === key ? 1 : 0.2)
      .style('stroke-width', d => d[0] === key ? '3px' : '2px');
    
    // Also dim the labels except for the highlighted one
    this.mainGroup.selectAll<SVGTextElement, LabelData>('.line-label')
      .style('opacity', d => d.key === key ? 1 : 0.2)
      .style('font-weight', d => d.key === key ? 'bold' : 'normal');

    // Dim connectors except for the highlighted one
    this.mainGroup.selectAll<SVGPathElement, LabelData>('.label-connector')
      .style('opacity', d => d.key === key ? 0.5 : 0.1)
      .style('stroke-width', d => d.key === key ? '1.5px' : '1px');
  }

  private unhighlightSeries(key: string) {
    if (!this.mainGroup) return;

    // Reset all lines to full opacity
    this.mainGroup.selectAll('.line')
      .style('opacity', 1)
      .style('stroke-width', '2px');
    
    // Reset all labels
    this.mainGroup.selectAll('.line-label')
      .style('opacity', 1)
      .style('font-weight', 'normal');

    // Reset all connectors
    this.mainGroup.selectAll('.label-connector')
      .style('opacity', 0.5)
      .style('stroke-width', '1px');
  }

  private showTooltip(event: MouseEvent, point: DataPoint) {
    if (!this.tooltip || !this.scales || !this.mainGroup) return;

    const formatValue = (value: number) => d3.format('.1f')(value) + '%';
    
    // Update tooltip content
    this.tooltip
      .style('opacity', 1)
      .html(`
        <div><strong>${point.hero}</strong></div>
        <div>Map: ${point.map}</div>
        <div>Rank: ${point.rank}</div>
        <div>Region: ${point.region}</div>
        <div>${this._metric}: ${formatValue(point.value)}</div>
        <div>Date: ${point.date.toLocaleDateString()}</div>
      `);

    // Update or create vertical line indicator
    const xPos = this.scales.xScale(point.date);
    
    // Remove any existing indicator line
    this.mainGroup.selectAll('.indicator-line').remove();
    
    // Add new indicator line
    this.mainGroup.append('line')
      .attr('class', 'indicator-line')
      .attr('x1', xPos)
      .attr('x2', xPos)
      .attr('y1', 0)
      .attr('y2', this.height)
      .style('stroke', '#666')
      .style('stroke-width', '1px')
      .style('stroke-dasharray', '3,3');
    
    this.moveTooltip(event);
  }

  private moveTooltip(event: MouseEvent) {
    if (!this.tooltip || !this.svg?.node()) return;

    // Get the SVG's position relative to the page
    const svgRect = this.svg.node().getBoundingClientRect();
    
    // Calculate position relative to the SVG
    const xPos = event.clientX - svgRect.left + 10; // 10px offset from cursor
    const yPos = event.clientY - svgRect.top - 10;  // 10px offset from cursor

    this.tooltip
      .style('left', `${xPos}px`)
      .style('top', `${yPos}px`);
  }

  private hideTooltip() {
    if (!this.tooltip || !this.mainGroup) return;
    this.tooltip.style('opacity', 0);
    this.mainGroup.selectAll('.indicator-line').remove();
  }

  private findNearestPoint(event: MouseEvent, points: DataPoint[]): DataPoint {
    if (!this.scales || !this.svg?.node()) return points[points.length - 1];

    const svgRect = this.svg.node().getBoundingClientRect();
    const mouseX = event.clientX - svgRect.left;
    
    // Convert mouse position to date
    const mouseDate = this.scales.xScale.invert(mouseX).getTime();
    
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

  private debounce(func: () => void, wait: number) {
    let timeout: any;
    return () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(), wait);
    };
  }
}
