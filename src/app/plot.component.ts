import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import * as d3 from 'd3';
import { DataPointForPlot, PlotData } from './models';

interface Scales {
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
  radiusScale: d3.ScaleLinear<number, number>;
}

@Component({
  selector: 'plot',
  templateUrl: './plot.component.html',
  styleUrls: ['./app.component.css'],
})
export class PlotComponent implements OnInit, OnDestroy {
  private svg!: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
  private scatter!: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
  private tooltip!: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>;

  // Chart dimensions and settings
  private readonly width: number = 1000;
  private readonly height: number = 500;
  private readonly minDotSize = 5;
  private readonly maxDotSize = 25;
  private readonly margin = { top: 0, right: 0, bottom: 100, left: 100 };

  // Scales for the chart
  private scales: Scales = {
    xScale: d3.scaleLinear(),
    yScale: d3.scaleLinear(),
    radiusScale: d3.scaleLinear(),
  };

  private _data: PlotData = {
    data: [],
    xLabel: 'No Data',
    yLabel: 'No Data',
  };

  @Input()
  set data(value: PlotData | undefined) {
    if (value) {
      this._data = value;
      if (this.svg) {
        this.redraw();
      } else {
        // Initialize and plot if we don't have SVG yet
        this.initSvg();
        this.plotData();
      }
    }
  }

  get data(): PlotData {
    return this._data;
  }

  constructor() {}

  ngOnInit() {
    this.initTooltip();
    this.initSvg();
  }

  ngOnDestroy() {
    this.tooltip?.remove();
    this.svg?.remove();
  }

  private initTooltip() {
    this.tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('pointer-events', 'none')
      .style('background', 'white')
      .style('padding', '5px')
      .style('border', '1px solid #000')
      .style('color', '#000');
  }

  private redraw(): void {
    this.clearPlot();
    this.initSvg();
    this.plotData();
  }

  private initSvg(): void {
    console.log('Initializing SVG...');
    // First clear any existing SVG content
    const existingSvg = d3.select<SVGSVGElement, unknown>('svg#plot');
    console.log('Found SVG element:', existingSvg.node());
    existingSvg.selectAll('*').remove();

    // Reset SVG attributes first
    existingSvg
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .attr(
        'viewBox',
        `0 0 ${this.width + this.margin.left + this.margin.right} ${this.height + this.margin.top + this.margin.bottom}`,
      )
      .style('background-color', '#ffffff') // Add background for visibility
      .style('overflow', 'visible') // Make sure elements outside the SVG are visible
      .style('cursor', 'move'); // Add move cursor to indicate draggable

    // Add a background rect to catch zoom events
    existingSvg
      .append('rect')
      .attr('class', 'zoom-area')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .attr('fill', 'none')
      .style('pointer-events', 'all');

    // Create new base SVG element with correct positioning
    this.svg = existingSvg
      .append('g')
      .attr('class', 'main-group')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    // Create a view group for elements that should be clipped
    const view = this.svg.append('g').attr('class', 'view');

    // Add a clip path for the view
    view
      .append('defs')
      .append('clipPath')
      .attr('id', 'view-clip')
      .append('rect')
      .attr('width', this.width - this.margin.left - this.margin.right)
      .attr('height', this.height - this.margin.top - this.margin.bottom);

    // Create the scatter group inside the view
    this.scatter = view.append('g').attr('class', 'scatter-plot').attr('clip-path', 'url(#view-clip)');

    console.log('SVG initialized with dimensions:', {
      width: this.width + this.margin.left + this.margin.right,
      height: this.height + this.margin.top + this.margin.bottom,
    });
    console.log('Scatter plot group:', this.scatter.node());
  }

  public clearPlot(): void {
    if (this.svg) {
      this.svg.selectAll('*').remove();
    }
  }

  private createScales(data: DataPointForPlot[]) {
    // Use d3.extent for more efficient min/max calculation
    const xExtent = d3.extent(data, (d) => d.x) as [number, number];
    const yExtent = d3.extent(data, (d) => d.y) as [number, number];
    const sizeExtent = d3.extent(data, (d) => d.size) as [number, number];

    // Calculate padding
    const xRange = xExtent[1] - xExtent[0];
    const yRange = yExtent[1] - yExtent[0];
    const xPadding = xRange * 0.2;
    const yPadding = yRange * 0.2;

    // Create scales
    const xScale = d3
      .scaleLinear()
      .domain([xExtent[0] - xPadding, xExtent[1] + xPadding])
      .range([0, this.width - this.margin.left - this.margin.right]);

    const yScale = d3
      .scaleLinear()
      .domain([yExtent[0] - yPadding, yExtent[1] + yPadding])
      .range([this.height - this.margin.top - this.margin.bottom, 0]);

    const radiusScale = d3.scaleLinear().domain(sizeExtent).range([this.minDotSize, this.maxDotSize]);

    return { xScale, yScale, radiusScale };
  }

  private plotData(): void {
    if (!this._data?.data?.length) {
      console.log('No data to plot:', this._data);
      return;
    }

    // Update the component's scales
    this.scales = this.createScales(this._data.data);

    console.log('Scale ranges:', {
      x: [0, this.width - this.margin.left - this.margin.right],
      y: [this.height - this.margin.top - this.margin.bottom, 0],
    });

    const xAxis = d3.axisBottom(this.scales.xScale);
    const yAxis = d3.axisLeft(this.scales.yScale);

    // Setup zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .extent([
        [0, 0],
        [this.width, this.height],
      ])
      .on('zoom', (event) => {
        // Rescale the axes using d3-zoom's built-in transform scaling
        const newXScale = event.transform.rescaleX(this.scales.xScale);
        const newYScale = event.transform.rescaleY(this.scales.yScale);

        // Update axes with new scales
        this.svg.select<SVGGElement>('.x-axis').call(d3.axisBottom(newXScale) as any);
        this.svg.select<SVGGElement>('.y-axis').call(d3.axisLeft(newYScale) as any);

        // Update point groups
        this.scatter.selectAll<SVGGElement, DataPointForPlot>('g.point').attr('transform', (d) => {
          const x = newXScale(d.x);
          const y = newYScale(d.y);
          return `translate(${x},${y})`;
        });
      });

    // Add zoom to the SVG
    d3.select<SVGSVGElement, unknown>('svg#plot').call(zoom as any);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const xAxisWrapper: any = this.svg
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${this.height - this.margin.top - this.margin.bottom})`)
      .call(xAxis);

    xAxisWrapper
      .append('text')
      .attr('x', this.width / 2)
      .attr('y', 60)
      .attr('fill', '#000')
      .attr('text-anchor', 'middle')
      .text(this._data.xLabel)
      .style('font-size', '20px');

    xAxisWrapper
      .selectAll('text:not(:last-child)')
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .attr('transform', (_: any, i: number) => {
        return 'translate(-15, 15)rotate(-45)';
      })
      .style('text-anchor', 'end')
      .style('font-size', '14px');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const yAxisWrapper: any = this.svg
      .append('g')
      .attr('class', 'y-axis')
      .attr('transform', `translate(0,0)`)
      .call(yAxis);

    yAxisWrapper
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', (-1 * this.height) / 2)
      .attr('y', -60)
      .attr('fill', '#000')
      .attr('text-anchor', 'middle')
      .text(this._data.yLabel)
      .style('font-size', '20px');

    yAxisWrapper
      .selectAll('text:not(:last-child)')
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .attr('transform', (_: any, i: number) => {
        return 'translate(-5, 0)';
      })
      .style('text-anchor', 'end')
      .style('font-size', '14px');

    console.log('Creating plot group');
    // Create a specific group for the dots with a class for debugging
    const group = this.scatter.append('g').attr('class', 'dots-group').attr('transform', `translate(0,0)`);
    console.log('Plot group created:', group.node());

    // Add dots with more explicit data binding
    console.log('Creating dots with data:', this._data.data);
    // Create a group for each data point
    const points = group
      .selectAll('g.point')
      .data(this._data.data)
      .join('g')
      .attr('class', 'point')
      .attr('transform', (row: DataPointForPlot) => {
        const x = this.scales.xScale(row.x);
        const y = this.scales.yScale(row.y);
        return `translate(${x},${y})`;
      });

    // Add circles
    points
      .append('circle')
      .attr('class', 'dot')
      .attr('r', (row: DataPointForPlot) => {
        const r = this.scales.radiusScale(row.size);
        console.log('Setting radius for point', row.label, ':', { size: row.size, r });
        return r;
      })
      .attr('fill', (row: DataPointForPlot) => row.color)
      .attr('opacity', '0.7')
      .attr('stroke', '#000')
      .attr('stroke-width', '1');

    // Add labels
    points
      .append('text')
      .attr('class', 'point-label')
      .attr('text-anchor', 'middle')
      .attr('y', (d: DataPointForPlot) => {
        const radius = this.scales.radiusScale(d.size);
        return -radius - 5; // Position above the circle with 5px padding
      })
      .style('font-size', '12px')
      .style('fill', '#000')
      .text((d: DataPointForPlot) => d.label);

    // Add event handlers for tooltips
    points
      .on('mouseover', (event: { currentTarget: EventTarget }, d: DataPointForPlot) => {
        // Highlight the current point
        d3.select(event.currentTarget as Element)
          .select('circle')
          .attr('stroke-width', '2')
          .attr('opacity', '1');

        const e = event as unknown as MouseEvent;
        this.tooltip.transition().duration(200).style('opacity', 1);

        this.tooltip
          .html(
            d.label +
              (d.labelAdditional ? `<br/>${d.labelAdditional}` : '') +
              `<br/>${d.xLabel}: ${d.x.toFixed(2)}<br/>${d.yLabel}: ${d.y.toFixed(2)}` +
              (d.sizeLabel ? `<br/>${d.sizeLabel}: ${d.size.toFixed(2)}` : ''),
          )
          .style('left', `${e.pageX + 10}px`)
          .style('top', `${e.pageY - 10}px`);
      })
      .on('mouseout', (event: { currentTarget: EventTarget }) => {
        // Restore normal point appearance
        d3.select(event.currentTarget as Element)
          .select('circle')
          .attr('stroke-width', '1')
          .attr('opacity', '0.7');

        this.tooltip.transition().duration(500).style('opacity', 0);
      });
  }
}
