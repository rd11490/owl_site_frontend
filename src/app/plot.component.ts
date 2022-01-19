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
  private clip: any;
  private scatter: any;

  private width: number = 500;
  private height: number = 500;
  private dataToPlot: PlotData = {
    data: [],
    xLabel: 'PLACE HOLDER',
    yLabel: 'PLACE HOLDER',
  };
  private margin = { top: 100, right: 100, bottom: 100, left: 100 };

  constructor() {}

  ngOnInit() {
    this.initSvg();
  }

  private initSvg = (): void => {
    this.svg = d3Select
      .select('svg')
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`)
      .attr('height', this.height)
      .attr('width', this.width);

    this.clip = this.svg
      .append('defs')
      .append('SVG:clipPath')
      .attr('id', 'clip')
      .append('SVG:rect')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('x', 0)
      .attr('y', 0);

    this.scatter = this.svg.append('g').attr('clip-path', 'url(#clip)');
  };

  private clearPlot() {
    console.log('clearing plot');
    this.svg.selectAll('#XAXIS').remove();
    this.svg.selectAll('#YAXIS').remove();
    this.scatter.selectAll('*').remove();
  }

  private plotData() {
    console.log('PLOTTING DATA');
    if (this.dataToPlot.data.length == 0) {
      return;
    }
    const sizes = this.dataToPlot.data.map((r) => r.size);
    const maxSize = Math.max(...sizes);
    const minSize = Math.min(...sizes);
    const sizeRange = maxSize - minSize;

    const xs = this.dataToPlot.data.map((r) => r.x);
    const maxX = Math.max(...xs);
    const minX = Math.min(...xs);
    const xRange = maxX - minX;

    const ys = this.dataToPlot.data.map((r) => r.y);
    const maxY = Math.max(...ys);
    const minY = Math.min(...ys);
    const yRange = maxY - minY;

    const minXPlot = minX - 0.1 * Math.abs(xRange);
    const maxXPlot = maxX + 0.1 * Math.abs(xRange);

    // Add X axis
    const xScale = d3.scaleLinear().domain([minXPlot, maxXPlot]).range([0, this.width]);
    this.svg
      .append('g')
      .call(d3.axisBottom(xScale))
      .attr('id', 'XAXIS')
      .attr('transform', `translate(0,${this.height})`)
      .call((g: any) =>
        g
          .append('text')
          .attr('x', this.width / 2)
          .attr('y', this.margin.bottom / 2)
          .attr('fill', 'black')
          .attr('text-anchor', 'end')
          .text(this.dataToPlot.xLabel)
      );

    const minYPlot = minY - 0.1 * Math.abs(yRange);
    const maxYPlot = maxY + 0.1 * Math.abs(yRange);

    // Add Y axis
    const yScale = d3.scaleLinear().domain([minYPlot, maxYPlot]).range([this.height, 0]);

    this.svg
      .append('g')
      .call(d3.axisLeft(yScale))
      .attr('id', 'YAXIS')
      .call((g: any) =>
        g
          .append('text')
          .attr('y', (-1 * this.margin.left) / 3)
          .attr('x', -this.width / 2)
          .attr('fill', 'black')
          .attr('text-anchor', 'start')
          .text(this.dataToPlot.yLabel)
          .attr('transform', 'rotate(-90)')
      );

    this.scatter
      .attr('viewBox', [0, 0, this.width, this.height])
      .attr('style', 'max-width: 100%; height: auto; height: intrinsic;');

    this.scatter
      .selectAll('circle')
      .data(this.dataToPlot.data)
      .enter()
      .append('circle')
      .attr('cx', (row: DataPointForPlot) => {
        return xScale(row.x);
      })
      .attr('cy', (row: DataPointForPlot) => {
        return yScale(row.y);
      })
      .attr('r', (row: DataPointForPlot) => {
        const range = 15.0 - 5.0;
        const mult = sizeRange / range;
        return (row.size - minSize) / mult + 5;
      })
      .attr('fill', (row: DataPointForPlot) => {
        return row.color;
      })
      .attr('id', 'POINT')
      .exit();

    this.scatter
      .selectAll('#LABEL')
      .data(this.dataToPlot.data)
      .enter()
      .append('text')
      .text((row: DataPointForPlot) => {
        return row.label;
      })
      .attr('class', 'LABEL')
      .attr('fill', (row: DataPointForPlot) => {
        return row.color;
      })
      .attr('x', (row: DataPointForPlot) => {
        return xScale(row.x) + 10;
      })
      .attr('y', (row: DataPointForPlot) => {
        return yScale(row.y) - 10;
      })
      .exit();
  }

  @Input()
  set data(dataToPlot: PlotData | undefined) {
    if (dataToPlot != null) {
      this.dataToPlot = dataToPlot;
      if (this.svg != null) {
        this.clearPlot();
        this.plotData();
      }
    }
  }
}
