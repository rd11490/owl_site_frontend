import { Component, Input, OnInit } from '@angular/core';
import * as d3 from 'd3';
import * as d3Select from 'd3-selection';
import { DataPointForPlot, PlotData } from './models';

@Component({
  selector: 'plot',
  templateUrl: './plot.component.html',
  styleUrls: ['./app.component.css'],
})
export class PlotComponent implements OnInit {
  private svg: any;
  private scatter: any;
  private tooltip: any;

  private width: number = 1000;
  private height: number = 500;

  private minDotSize = 5;
  private maxDotSize = 25;

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
      }
    }
  }

  private margin = { top: 0, right: 0, bottom: 100, left: 100 };

  constructor() {}

  ngOnInit() {
    this.tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('pointer-events', 'none')
      .style('background', 'white')
      .style('padding', '5px')
      .style('border', '1px solid #ccc');
    this.initSvg();
  }

  private redraw(): void {
    this.clearPlot();
    this.initSvg();
    this.plotData();
  }

  private initSvg(): void {
    this.svg = d3Select
      .select('svg')
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`)
      .attr('height', this.height)
      .attr('width', this.width);

    this.scatter = this.svg.append('g');
  }

  public clearPlot(): void {
    if (this.svg) {
      this.svg.selectAll('*').remove();
    }
  }

  private plotData(): void {
    if (!this._data || !this._data.data || this._data.data.length === 0) {
      return;
    }

    const sizes = this._data.data.map((r: DataPointForPlot) => r.size);
    const scaleRadius = d3
      .scaleLinear()
      .domain([Math.min(...sizes), Math.max(...sizes)])
      .range([this.minDotSize, this.maxDotSize]);

    const xs = this._data.data.map((r: DataPointForPlot) => r.x);
    const xScale = d3
      .scaleLinear()
      .domain([Math.min(...xs), Math.max(...xs)])
      .range([0, this.width - this.margin.left - this.margin.right]);

    const ys = this._data.data.map((r: DataPointForPlot) => r.y);
    const yScale = d3
      .scaleLinear()
      .domain([Math.min(...ys), Math.max(...ys)])
      .range([this.height - this.margin.top - this.margin.bottom, 0]);

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    const zoom = d3.zoom().on('zoom', (event) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newX = event.transform.rescaleX(xScale);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newY = event.transform.rescaleY(yScale);

      this.scatter.selectAll('circle').attr('transform', event.transform);

      this.scatter.select('.x-axis').call(xAxis.scale(newX));
      this.scatter.select('.y-axis').call(yAxis.scale(newY));
    });

    this.svg.call(zoom);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const xAxisWrapper: any = this.scatter
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
    const yAxisWrapper: any = this.scatter
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

    const group = this.scatter.append('g');

    // Add dots
    group
      .selectAll('.dots')
      .data(this._data.data)
      .enter()
      .append('circle')
      .attr('cx', (row: DataPointForPlot) => {
        return xScale(row.x);
      })
      .attr('cy', (row: DataPointForPlot) => {
        return yScale(row.y);
      })
      .attr('r', (row: DataPointForPlot) => {
        return scaleRadius(row.size);
      })
      .style('fill', (row: DataPointForPlot) => {
        return row.color;
      })
      .style('opacity', 0.7)
      .style('stroke', '#000')
      .style('stroke-width', 1)
      .on('mouseover', (event: PointerEvent, row: DataPointForPlot) => {
        this.tooltip.transition().duration(200).style('opacity', 0.9);
        this.tooltip
          .html(
            row.label +
              (row.labelAdditional ? `<br/>${row.labelAdditional}` : '') +
              `<br/>X: ${row.xLabel}<br/>Y: ${row.yLabel}<br/>Size: ${row.sizeLabel}`,
          )
          .style('left', `${event.pageX}px`)
          .style('top', `${event.pageY}px`);
      })
      .on('mouseout', () => {
        this.tooltip.transition().duration(500).style('opacity', 0);
      });
  }
}
