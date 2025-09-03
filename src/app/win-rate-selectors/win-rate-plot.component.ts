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
  originalX: number;
  originalY: number;
  width: number;
  height: number;
  // D3 force simulation properties
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
  index?: number;
};

@Component({
  selector: 'win-rate-plot',
  template: `
    <div class="win-rate-plot-container">
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

  // Chart dimensions
  private margin = { top: 20, right: 20, bottom: 100, left: 70 }; // Increased bottom margin for legend
  private width = 0;  // Will be set based on container
  private height = 0; // Will be set based on container
  private scales!: Scales;
  private readonly legendItemWidth = 200; // Width of each legend entry
  private readonly legendItemHeight = 20; // Height of each legend entry

  ngOnInit() {
    // Setup resize observer with debounced handler
    this.resizeObserver = new ResizeObserver(this.debounce(() => {
      this.updateDimensions();
    }, 100));
  }

  ngAfterViewInit() {
    this.initializePlot();
    this.initialized = true;
    if (this.containerRef?.nativeElement) {
      this.resizeObserver?.observe(this.containerRef.nativeElement);
    }
    this.updatePlot();
  }

  ngOnDestroy() {
    // Clean up resources
    this.resizeObserver?.disconnect();
    this.tooltip?.remove();
  }

  private updateDimensions() {
    if (!this.svgRef?.nativeElement) return;

    const container = this.svgRef.nativeElement.parentElement;
    if (!container) return;

    // Get the container width
    const containerRect = container.getBoundingClientRect();
    const baseHeight = 800; // Base height for the main plot area
    
    // Calculate legend rows needed
    this.width = containerRect.width - this.margin.left - this.margin.right;
    const itemsPerRow = Math.floor(this.width / this.legendItemWidth);
    const numEntries = Array.from(this._data).length;
    const legendRows = numEntries > 0 ? Math.ceil(numEntries / itemsPerRow) : 0;
    const legendHeight = (legendRows * this.legendItemHeight) + 60; // 60px for padding and axis label

    // Set the plot height to maintain the main chart area
    this.height = baseHeight - this.margin.top - this.margin.bottom;
    this.margin.bottom = legendHeight;
    
    // Calculate total SVG height
    const totalHeight = baseHeight + legendHeight;

    // Update SVG dimensions
    if (this.svg) {
      // Update the SVG element size
      const totalWidth = containerRect.width;
      const baseHeight = 800;
      const totalHeight = baseHeight + this.margin.bottom;
      
      // Set explicit dimensions on the SVG
      this.svg
        .attr('width', totalWidth)
        .attr('height', totalHeight)
        .attr('viewBox', `0 0 ${totalWidth} ${totalHeight}`);

      // Update all background elements
      this.svg.select('.chart-background')
        .attr('width', '100%')
        .attr('height', '100%');

      this.svg.select('.zoom-area')
        .attr('width', containerRect.width)
        .attr('height', containerRect.height);

      // Update main group background
      this.mainGroup.select('.main-background')
        .attr('x', -this.margin.left)
        .attr('y', -this.margin.top)
        .attr('width', containerRect.width)
        .attr('height', containerRect.height);

      // Update plot area background
      this.mainGroup.select('.plot-background')
        .attr('width', this.width)
        .attr('height', this.height);

      // Update axis backgrounds
      const yAxisBg = this.mainGroup.select('.axis-background:first-child');
      const xAxisBg = this.mainGroup.select('.axis-background:last-child');

      yAxisBg
        .attr('x', -this.margin.left)
        .attr('y', 0)
        .attr('width', this.margin.left)
        .attr('height', this.height);

      xAxisBg
        .attr('x', 0)
        .attr('y', this.height)
        .attr('width', this.width)
        .attr('height', this.margin.bottom);

      // Update scales if they exist
      if (this.scales) {
        this.scales.xScale.range([0, this.width]);
        this.scales.yScale.range([this.height, 0]);
      }

      // Update clip path
      this.mainGroup.select('#plot-area rect')
        .attr('width', this.width)
        .attr('height', this.height);

      // Update axes
      this.xAxis.attr('transform', `translate(0,${this.height})`);
      
      // Trigger a redraw if we have data
      if (this._data.length && this.scales) {
        this.updatePlot();
      }
    }
  }

  private initializePlot() {
    if (!this.svgRef?.nativeElement) return;

    const container = this.svgRef.nativeElement.parentElement;
    if (!container) return;

    // Get initial dimensions from container
    const containerRect = container.getBoundingClientRect();
    this.width = containerRect.width - this.margin.left - this.margin.right;
    this.height = containerRect.height - this.margin.top - this.margin.bottom;

    // Initialize D3 elements with explicit white background
    this.svg = d3.select(this.svgRef.nativeElement)
      .attr('width', containerRect.width)
      .attr('height', containerRect.height)
      .attr('viewBox', `0 0 ${containerRect.width} ${containerRect.height}`)
      .style('background-color', 'white'); // Ensure SVG has white background

    // Add full-size white background rect
    this.svg.append('rect')
      .attr('class', 'chart-background')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', 'white');

    // Add zoom area that covers the whole chart
    this.svg.append('rect')
      .attr('class', 'zoom-area')
      .attr('width', containerRect.width)
      .attr('height', containerRect.height)
      .attr('fill', 'white');

    // Create main group with white background
    this.mainGroup = this.svg.append('g')
      .attr('class', 'main-group')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    // Add background rect for main plot area
    this.mainGroup.append('rect')
      .attr('class', 'main-background')
      .attr('x', -this.margin.left)
      .attr('y', -this.margin.top)
      .attr('width', containerRect.width)
      .attr('height', containerRect.height)
      .attr('fill', 'white');

    // Add white background for the plot area
    this.mainGroup.append('rect')
      .attr('class', 'plot-background')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('fill', 'white');

    // Create a clip path to prevent data from rendering outside the plot area
    this.mainGroup.append('defs')
      .append('clipPath')
      .attr('id', 'plot-area')
      .append('rect')
      .attr('width', this.width)
      .attr('height', this.height);

    // Add background rects for axes
    this.mainGroup.append('rect')
      .attr('class', 'axis-background')
      .attr('x', -this.margin.left)
      .attr('y', 0)
      .attr('width', this.margin.left)
      .attr('height', this.height)
      .attr('fill', 'white');

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
    // Create a simple hash of the key
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = ((hash << 5) - hash) + key.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }

    // Use the hash to generate HSL color
    // Use golden ratio to spread the hues around
    const hue = Math.abs(hash % 360);
    // Keep saturation and lightness in a pleasing range
    const saturation = 70 + Math.abs(hash % 20); // 70-90%
    const lightness = 45 + Math.abs((hash >> 8) % 10); // 45-55%

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  private initializeScales() {
    this.scales = {
      xScale: d3.scaleTime().range([0, this.width]),
      yScale: d3.scaleLinear().range([this.height, 0]),
      colorScale: (key: string) => this.generateUniqueColor(key),
      colorCategory: 'combined' as 'hero' | 'map' | 'rank' | 'region'
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
    // Find which values are common across all series
    const commonValues = {
      hero: allPoints.every(p => p.hero === point.hero),
      rank: allPoints.every(p => p.rank === point.rank),
      map: allPoints.every(p => p.map === point.map),
      region: allPoints.every(p => p.region === point.region)
    };

    const components: string[] = [];
    
    // Only include values that are not common across all series and not 'All'
    if (!commonValues.hero && point.hero !== 'All') {
      components.push(point.hero);
    }
    if (!commonValues.rank && point.rank !== 'All') {
      components.push(point.rank);
    }
    if (!commonValues.map && point.map !== 'All') {
      components.push(point.map);
    }
    if (!commonValues.region && point.region !== 'All') {
      components.push(point.region);
    }

    // If all values were common or 'All', use the first non-'All' value
    if (components.length === 0) {
      if (point.hero !== 'All') return point.hero;
      if (point.rank !== 'All') return point.rank;
      if (point.map !== 'All') return point.map;
      if (point.region !== 'All') return point.region;
      return 'All'; // Fallback if everything is 'All'
    }

    return components.join(' - ');
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
    this.scales.yScale.domain([yMin, yMax]).nice();
  }

  private updateAxes() {
    if (!this.xAxis || !this.yAxis || !this.scales) return;

    // Get all dates from the data for x-axis ticks
    const allPoints = Array.from(this._data).map(d => d.data).flat();
    const allDates = allPoints.map(d => new Date(d.date))
      .sort((a, b) => a.getTime() - b.getTime());

    // Add some padding to the x-axis domain
    const xExtent = d3.extent(allDates) as [Date, Date];
    const xRange = xExtent[1].getTime() - xExtent[0].getTime();
    const xPadding = xRange * 0.02; // 2% padding

    this.scales.xScale.domain([
      new Date(xExtent[0].getTime() - xPadding),
      new Date(xExtent[1].getTime() + xPadding)
    ]);

    this.xAxis.call(
      d3.axisBottom(this.scales.xScale)
        .tickValues(allDates)
        .tickFormat(d => d3.timeFormat('%Y-%m-%d')(d as Date))
    );

    this.yAxis.call(
      d3.axisLeft(this.scales.yScale)
        .tickFormat(d => d3.format('.0f')(d) + '%')
    );

    // Remove any existing labels
    this.mainGroup.selectAll('.axis-label').remove();

    // Add X-axis label
    this.mainGroup.append('text')
      .attr('class', 'axis-label')
      .attr('x', this.width / 2)
      .attr('y', this.height + 35) // Move down further to clear the rotated tick labels
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', 'black')
      .text('Date');

    // Add Y-axis label
    this.mainGroup.append('text')
      .attr('class', 'axis-label')
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

  private updateLegend(data: Map<string, DataPoint[]>) {
    if (!this.mainGroup || !this.scales) return;

    // Remove existing legend
    this.mainGroup.selectAll('.legend').remove();

    // Get all series and their display labels
    const allPoints = Array.from(data.values())
      .map(points => points[0])
      .filter((point): point is DataPoint => point !== undefined);

    const legendEntries = Array.from(data.entries()).map(([key, points]) => {
      if (points.length === 0) return null;
      const point = points[0];
      return {
        key: key,
        label: this.getDisplayLabel(point, allPoints),
        color: this.generateUniqueColor(key)
      };
    }).filter((entry): entry is {key: string; label: string; color: string} => entry !== null)
      .sort((a, b) => a.label.localeCompare(b.label));

    // Calculate legend layout
    const itemsPerRow = Math.floor(this.width / this.legendItemWidth);
    const rows = Math.ceil(legendEntries.length / itemsPerRow);
    
    // Create legend group centered below the plot
    const legend = this.mainGroup.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(0, ${this.height + 55})`); // Position below x-axis label

    // Add legend items
    const legendItems = legend.selectAll('.legend-item')
      .data(legendEntries)
      .join('g')
      .attr('class', 'legend-item')
      .attr('transform', (_, i) => {
        const row = Math.floor(i / itemsPerRow);
        const col = i % itemsPerRow;
        return `translate(${col * this.legendItemWidth}, ${row * this.legendItemHeight})`;
      });

    // Add colored rectangles
    legendItems.append('rect')
      .attr('width', 10)
      .attr('height', 10)
      .attr('fill', d => d.color)
      .style('stroke', 'black')
      .style('stroke-width', '0.5px');

    // Add text labels with ellipsis if too long
    const textLabels = legendItems.append('text')
      .attr('x', 15)
      .attr('y', 9)
      .attr('font-size', '12px')
      .text(d => d.label)
      .style('fill', 'black');
      
    // Add title/tooltip for long labels
    textLabels.append('title')
      .text(d => d.label);

    // Add hover interactions
    legendItems
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        // Highlight the corresponding line
        this.highlightSeries(d.key);
      })
      .on('mouseout', (event, d) => {
        // Reset highlighting
        this.unhighlightSeries(d.key);
      });
  }

  private updatePlot() {
    if (!this._data.length || !this.scales) return;

    // Transform data for plotting
    const plotData = this.transformData();
    
    // Update scales
    this.updateScales(plotData);
    
    // Update axes
    this.updateAxes();
    
    // Update lines
    this.updateLines(plotData);

    // Update legend
    this.updateLegend(plotData);
  }

  private updateLines(data: Map<string, DataPoint[]>) {
    if (!this.mainGroup || !this.scales) return;

    // Create zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.5, 20])  // Allow zooming from 0.5x to 20x
      .extent([[0, 0], [this.width, this.height]])
      .on('zoom', (event: d3.D3ZoomEvent<any, any>) => {
        // Get the new scale transforms
        const newXScale = event.transform.rescaleX(this.scales!.xScale);
        const newYScale = event.transform.rescaleY(this.scales!.yScale);

        // Get all unique dates from the data
        const allPoints = Array.from(data.values()).flat();
        const allDates = allPoints.map(d => d.date)
          .sort((a, b) => a.getTime() - b.getTime());

        // Update axes with new scales
        this.xAxis.call(
          d3.axisBottom(newXScale)
            .tickValues(allDates)
            .tickFormat(d => d3.timeFormat('%Y-%m-%d')(d as Date))
        );
        this.yAxis.call(
          d3.axisLeft(newYScale)
            .tickFormat(d => d3.format('.0f')(d) + '%')
        );

        // Update all paths with new scales
        this.mainGroup.selectAll<SVGPathElement, [string, DataPoint[]]>('.line')
          .attr('d', ([_, points]) => {
            return d3.line<DataPoint>()
              .x(d => newXScale(d.date))
              .y(d => newYScale(d.value))
              .curve(d3.curveMonotoneX)(points);
          });

        // Update label positions
        this.mainGroup.selectAll<SVGTextElement, LabelData>('.line-label')
          .attr('x', d => {
            const points = data.get(d.key);
            if (!points || points.length === 0) return d.x;
            const lastPoint = points[points.length - 1];
            return newXScale(lastPoint.date) + 10;
          })
          .attr('y', d => {
            const points = data.get(d.key);
            if (!points || points.length === 0) return d.y;
            const lastPoint = points[points.length - 1];
            return newYScale(lastPoint.value);
          });
      });

    // Apply zoom to the SVG
    this.svg.call(zoom as any);

    const line = d3.line<DataPoint>()
      .x(d => this.scales.xScale(d.date))
      .y(d => this.scales.yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Create a group for the lines that will be clipped
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
    const allPoints = Array.from(data.values()).flat();
    const tempLabels: (LabelData | null)[] = Array.from(data.entries()).map(([key, points]) => {
      if (points.length === 0) return null;
      const lastPoint = points[points.length - 1];
      const x = this.scales.xScale(lastPoint.date) + 10;
      const y = this.scales.yScale(lastPoint.value);
      return {
        key,
        lastPoint,
        label: this.getDisplayLabel(lastPoint, allPoints),
        x,
        y,
        originalX: x,
        originalY: y,
        width: 0,
        height: 0,
      };
    });

    const labelData: LabelData[] = tempLabels.filter((d): d is LabelData => d !== null);

    // Update labels
    const labels = this.mainGroup.selectAll<SVGTextElement, LabelData>('.line-label')
      .data(labelData);

    // Remove old labels
    labels.exit().remove();

    // Add new labels
    const labelsEnter = labels.enter()
      .append('text')
      .attr('class', 'line-label');

    // Update + Enter
    const labelsUpdate = labels.merge(labelsEnter)
      .attr('dy', '0.35em')
      .attr('font-size', '12px')
      .style('fill', d => this.generateUniqueColor(d.key))
      .text(d => d.label);

    // Get label dimensions
    labelsUpdate.each(function(d: LabelData) {
      const bbox = (this as SVGTextElement).getBBox();
      d.width = bbox.width;
      d.height = bbox.height;
    });

    // Helper function to calculate point-to-line distance
    const distanceToLine = (point: { x: number, y: number }, linePoints: { x: number, y: number }[]) => {
      let minDist = Infinity;
      for (let i = 1; i < linePoints.length; i++) {
        const p1 = linePoints[i - 1];
        const p2 = linePoints[i];
        
        // Line segment vector
        const lineVec = { x: p2.x - p1.x, y: p2.y - p1.y };
        // Vector from point to line start
        const pointVec = { x: point.x - p1.x, y: point.y - p1.y };
        
        // Length of line segment squared
        const lineLength2 = lineVec.x * lineVec.x + lineVec.y * lineVec.y;
        
        // If line segment has zero length, just use distance to point
        if (lineLength2 === 0) {
          const dist = Math.sqrt(pointVec.x * pointVec.x + pointVec.y * pointVec.y);
          minDist = Math.min(minDist, dist);
          continue;
        }
        
        // Project point onto line segment
        const t = Math.max(0, Math.min(1, (pointVec.x * lineVec.x + pointVec.y * lineVec.y) / lineLength2));
        
        // Get closest point on line segment
        const projection = {
          x: p1.x + t * lineVec.x,
          y: p1.y + t * lineVec.y
        };
        
        // Calculate distance
        const dx = point.x - projection.x;
        const dy = point.y - projection.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        minDist = Math.min(minDist, dist);
      }
      return minDist;
    };

    // Create line points arrays for each series
    const linePoints = Array.from(data.entries()).map(([_, points]) => {
      return points.map(p => ({
        x: this.scales.xScale(p.date),
        y: this.scales.yScale(p.value)
      }));
    });

    // Create force simulation
    const simulation = d3.forceSimulation(labelData)
      .force('x', d3.forceX<LabelData>(d => d.originalX).strength(0.2))
      .force('y', d3.forceY<LabelData>(d => d.originalY).strength(0.2))
      .force('collision', d3.forceCollide<LabelData>().radius(d => d.width / 2 + 5))
      // Add force to avoid lines
      .force('line-avoid', alpha => {
        const padding = 10; // Minimum distance from lines
        for (const label of labelData) {
          const labelCenter = {
            x: (label.x || 0) + label.width / 2,
            y: (label.y || 0) + label.height / 2
          };
          
          // Check distance to all lines
          for (const line of linePoints) {
            const dist = distanceToLine(labelCenter, line);
            if (dist < padding) {
              // Calculate the nearest point on the line
              let nearestX = 0;
              let nearestY = 0;
              let minDist = Infinity;
              
              for (let i = 1; i < line.length; i++) {
                const p1 = line[i - 1];
                const p2 = line[i];
                const lineVec = { x: p2.x - p1.x, y: p2.y - p1.y };
                const pointVec = { x: labelCenter.x - p1.x, y: labelCenter.y - p1.y };
                const lineLength2 = lineVec.x * lineVec.x + lineVec.y * lineVec.y;
                const t = Math.max(0, Math.min(1, (pointVec.x * lineVec.x + pointVec.y * lineVec.y) / lineLength2));
                const projX = p1.x + t * lineVec.x;
                const projY = p1.y + t * lineVec.y;
                const dx = labelCenter.x - projX;
                const dy = labelCenter.y - projY;
                const dist2 = dx * dx + dy * dy;
                if (dist2 < minDist) {
                  minDist = dist2;
                  nearestX = projX;
                  nearestY = projY;
                }
              }
              
              // Push away from the nearest point
              const pushX = labelCenter.x - nearestX;
              const pushY = labelCenter.y - nearestY;
              const pushDist = Math.sqrt(pushX * pushX + pushY * pushY);
              if (pushDist > 0) {
                const force = (padding - dist) * alpha * 0.5;
                label.vx = (label.vx || 0) + (pushX / pushDist) * force;
                label.vy = (label.vy || 0) + (pushY / pushDist) * force;
              }
            }
          }
        }
      })
      .force('bounds', () => {
        for (const d of labelData) {
          d.x = Math.max(0, Math.min(this.width - d.width, d.x || 0));
          d.y = Math.max(0, Math.min(this.height - d.height, d.y || 0));
        }
      });

    // Update positions on each tick
    simulation.on('tick', () => {
      labelsUpdate
        .attr('x', (d: LabelData) => d.x || 0)
        .attr('y', (d: LabelData) => d.y || 0);

      // Draw connector lines
      const connectors = this.mainGroup.selectAll<SVGPathElement, LabelData>('.label-connector')
        .data(labelData);

      connectors.exit().remove();

      const connectorsEnter = connectors.enter()
        .append('path')
        .attr('class', 'label-connector')
        .style('fill', 'none')
        .style('stroke', '#999')
        .style('stroke-width', '1px')
        .style('opacity', 0.5);

      connectors.merge(connectorsEnter)
        .attr('d', (d: LabelData) => {
          const lineEndX = this.scales.xScale(d.lastPoint.date);
          const lineEndY = this.scales.yScale(d.lastPoint.value);
          return `M ${lineEndX} ${lineEndY} L ${d.x || 0} ${(d.y || 0) + d.height / 2}`;
        });
    });

    // Run simulation
    simulation.alpha(1).restart();

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
