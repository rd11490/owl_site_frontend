import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';
import { WinRateData } from '../models';
import { MetricType } from './metric-selector.component';

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
  colorScale: d3.ScaleOrdinal<string, string>;
}

@Component({
  selector: 'win-rate-plot',
  template: `
    <div class="win-rate-plot-container">
      <svg #svg></svg>
      <div #legend class="legend"></div>
      <div #tooltip class="tooltip"></div>
    </div>
  `,
  styles: [`
    .win-rate-plot-container {
      position: relative;
      width: 100%;
      height: 600px;
      margin: 20px 0;
    }
    svg {
      width: 100%;
      height: 100%;
    }
    .legend {
      position: absolute;
      top: 20px;
      right: 20px;
      background: rgba(255, 255, 255, 0.95);
      padding: 12px;
      border-radius: 6px;
      border: 1px solid #ddd;
      max-height: calc(100% - 40px);
      overflow-y: auto;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      z-index: 1;
    }
    .legend div {
      margin: 6px 0;
      cursor: pointer;
      opacity: 1;
      transition: opacity 0.2s ease;
    }
    .legend div.dimmed {
      opacity: 0.5;
    }
    .line {
      transition: opacity 0.2s ease;
    }
    .line.dimmed {
      opacity: 0.2;
    }
    .tooltip {
      position: absolute;
      pointer-events: none;
      background: rgba(255, 255, 255, 0.95);
      padding: 10px 14px;
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
  @ViewChild('container') containerRef!: ElementRef;
  @ViewChild('svg') svgRef!: ElementRef;
  @ViewChild('legend') legendRef!: ElementRef;
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
  private legend!: D3Selection;

  // Chart dimensions
  private margin = { top: 20, right: 150, bottom: 30, left: 50 };
  private width = 800;
  private height = 400;
  private scales!: Scales;

  ngOnInit() {
    // Setup resize observer
    this.resizeObserver = new ResizeObserver(() => {
      this.updateDimensions();
      if (this.initialized) {
        this.updatePlot();
      }
    });
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
    const container = this.containerRef?.nativeElement;
    if (!container) return;

    this.width = container.clientWidth - this.margin.left - this.margin.right;
    this.height = container.clientHeight - this.margin.top - this.margin.bottom;
    
    if (this.svg) {
      this.svg
        .attr('width', this.width + this.margin.left + this.margin.right)
        .attr('height', this.height + this.margin.top + this.margin.bottom);
      
      if (this.scales) {
        this.scales.xScale.range([0, this.width]);
        this.scales.yScale.range([this.height, 0]);
      }
    }
  }

  private initializePlot() {
    if (!this.svgRef?.nativeElement) return;

    // Initialize D3 elements
    this.svg = d3.select(this.svgRef.nativeElement)
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom);

    this.mainGroup = this.svg.append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    // Create axes
    this.xAxis = this.mainGroup.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${this.height})`);

    this.yAxis = this.mainGroup.append('g')
      .attr('class', 'y-axis');

    // Create tooltip
    this.tooltip = d3.select(this.tooltipRef?.nativeElement)
      .style('opacity', 0);

    // Initialize legend
    this.legend = d3.select(this.legendRef?.nativeElement);

    // Initialize scales
    this.initializeScales();
  }

  private initializeScales() {
    this.scales = {
      xScale: d3.scaleTime().range([0, this.width]),
      yScale: d3.scaleLinear().range([this.height, 0]),
      colorScale: d3.scaleOrdinal(d3.schemeCategory10)
    };
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

  private updateScales(data: Map<string, DataPoint[]>) {
    if (!this.scales) return;

    // Find min/max dates and values across all series
    const allPoints = Array.from(data.values()).flat();
    
    this.scales.xScale.domain(d3.extent(allPoints, d => d.date) as [Date, Date]);
    this.scales.yScale.domain([0, d3.max(allPoints, d => d.value) || 1]);
    this.scales.colorScale.domain(Array.from(data.keys()));
  }

  private updateAxes() {
    if (!this.xAxis || !this.yAxis || !this.scales) return;

    // Update X axis
    this.xAxis.call(d3.axisBottom(this.scales.xScale));

    // Update Y axis with percentage format
    this.yAxis.call(
      d3.axisLeft(this.scales.yScale)
        .tickFormat(d => d3.format('.0%')(d))
    );
  }

  private updateLines(data: Map<string, DataPoint[]>) {
    if (!this.mainGroup || !this.scales) return;

    const line = d3.line<DataPoint>()
      .x(d => this.scales.xScale(d.date))
      .y(d => this.scales.yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Update lines with transition
    const lines = this.mainGroup.selectAll<SVGPathElement, [string, DataPoint[]]>('.line')
      .data(Array.from(data.entries()), (d: [string, DataPoint[]]) => d[0]);

    // Exit
    lines.exit()
      .transition()
      .duration(300)
      .style('opacity', 0)
      .remove();

    // Enter
    const linesEnter = lines.enter()
      .append('path')
      .attr('class', 'line')
      .attr('fill', 'none')
      .attr('stroke-width', 2)
      .style('opacity', 0);

    // Update + Enter
    lines.merge(linesEnter as any)
      .attr('stroke', (d: [string, DataPoint[]]) => this.scales?.colorScale(d[0]) || '#000')
      .transition()
      .duration(500)
      .style('opacity', 1)
      .attr('d', (d: [string, DataPoint[]]) => line(d[1]));

    // Add events
    const that = this;
    this.mainGroup.selectAll<SVGPathElement, [string, DataPoint[]]>('.line')
      .on('mouseover', (event: any, d: [string, DataPoint[]]) => {
        const points = d[1];
        if (points.length > 0) {
          that.showTooltip(event, points[points.length - 1]);
          that.highlightSeries(d[0]);
        }
      })
      .on('mousemove', (event: any) => {
        that.moveTooltip(event);
      })
      .on('mouseout', (event: any, d: [string, DataPoint[]]) => {
        that.hideTooltip();
        that.unhighlightSeries(d[0]);
      });
  }

  private updateLegend(data: Map<string, DataPoint[]>) {
    if (!this.legend || !this.scales) return;

    this.legend.html('');
    
    Array.from(data.entries()).forEach(([key, points]) => {
      const item = this.legend.append('div')
        .style('margin-bottom', '8px')
        .style('display', 'flex')
        .style('align-items', 'center')
        .on('mouseover', () => this.highlightSeries(key))
        .on('mouseout', () => this.unhighlightSeries(key));

      item.append('div')
        .style('width', '12px')
        .style('height', '12px')
        .style('margin-right', '8px')
        .style('background-color', this.scales.colorScale(key));

      item.append('span')
        .text(this.formatLegendLabel(points[0]));
    });
  }

  private formatLegendLabel(point: DataPoint): string {
    return `${point.hero} on ${point.map} (${point.rank}, ${point.region})`;
  }

  private showTooltip(event: MouseEvent, point: DataPoint) {
    if (!this.tooltip) return;

    const formatValue = d3.format('.1%');
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
    this.moveTooltip(event);
  }

  private moveTooltip(event: MouseEvent) {
    if (!this.tooltip) return;

    this.tooltip
      .style('left', (event.pageX + 10) + 'px')
      .style('top', (event.pageY - 10) + 'px');
  }

  private hideTooltip() {
    if (!this.tooltip) return;
    this.tooltip.style('opacity', 0);
  }

  private highlightSeries(key: string) {
    if (!this.mainGroup || !this.legend) return;

    // Dim all lines except the highlighted one
    this.mainGroup.selectAll<SVGPathElement, [string, DataPoint[]]>('.line')
      .style('opacity', d => d[0] === key ? 1 : 0.2);

    // Highlight the corresponding legend item
    const seriesKeys = Array.from(new Set(this._data.map(d => this.getSeriesKey(d))));
    this.legend.selectAll('div')
      .style('opacity', (_, i) => seriesKeys[i] === key ? 1 : 0.5);
  }

  private unhighlightSeries(key: string) {
    if (!this.mainGroup || !this.legend) return;

    // Reset all lines to full opacity
    this.mainGroup.selectAll('.line')
      .style('opacity', 1);

    // Reset all legend items to full opacity
    this.legend.selectAll('div')
      .style('opacity', 1);
  }
}

