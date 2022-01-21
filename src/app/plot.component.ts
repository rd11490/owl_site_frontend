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

  private dataToPlot: PlotData = {
    data: [],
    xLabel: 'PLACE HOLDER',
    yLabel: 'PLACE HOLDER',
  };
  private margin = { top: 0, right: 0, bottom: 100, left: 100 };

  constructor() {}

  ngOnInit() {
    this.tooltip = d3.select('.app-container').attr('class', 'tooltip').style('opacity', 0);
    this.initSvg();
  }

  private initSvg = (): void => {
    this.svg = d3Select
      .select('svg')
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`)
      .attr('height', this.height)
      .attr('width', this.width);

    this.svg
      .append('defs')
      .append('SVG:clipPath')
      .attr('id', 'clip')
      .append('SVG:rect')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('x', 0)
      .attr('y', 0);
  };

  public clearPlot() {
    d3Select.select('svg').selectChildren().remove();
  }

  private plotData() {
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
    let xScale = d3.scaleLinear().domain([minXPlot, maxXPlot]).range([0, this.width]);
    const xAxis = this.svg
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
          .attr('text-anchor', 'middle')
          .text(this.dataToPlot.xLabel)
          .style('font-size', '16px')
      );

    const minYPlot = minY - 0.1 * Math.abs(yRange);
    const maxYPlot = maxY + 0.1 * Math.abs(yRange);

    const scaleRadius = (rad: number): number => {
      const range = this.maxDotSize - this.minDotSize;
      if (range == 0 || sizeRange == 0) {
        return this.minDotSize;
      }
      const mult = sizeRange / range;
      return (rad - minSize) / mult + this.minDotSize;
    };

    // Add Y axis
    let yScale = d3.scaleLinear().domain([minYPlot, maxYPlot]).range([this.height, 0]);

    const yAxis = this.svg
      .append('g')
      .call(d3.axisLeft(yScale))
      .attr('id', 'YAXIS')
      .call((g: any) =>
        g
          .append('text')
          .attr('y', (-2 * this.margin.left) / 3)
          .attr('x', -this.height / 2)
          .attr('fill', 'black')
          .attr('text-anchor', 'middle')
          .text(this.dataToPlot.yLabel)
          .style('font-size', '16px')
          .attr('transform', 'rotate(-90)')
      );

    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 20]) // This control how much you can unzoom (x0.5) and zoom (x20)
      .extent([
        [0, 0],
        [this.width, this.height],
      ])
      .on('zoom', (event) => {
        // recover the new scale
        var newX = event.transform.rescaleX(xScale);
        var newY = event.transform.rescaleY(yScale);

        // update axes with these new boundaries
        xAxis.call(d3.axisBottom(newX));
        yAxis.call(d3.axisLeft(newY));

        // update circle position
        this.scatter
          .selectAll('circle')
          .attr('cx', (row: DataPointForPlot) => {
            return newX(row.x);
          })
          .attr('cy', (row: DataPointForPlot) => {
            return newY(row.y);
          });

        // update label position
        this.scatter
          .selectAll('text')
          .attr('x', (row: DataPointForPlot) => {
            return newX(row.x) + scaleRadius(row.size) + 1;
          })
          .attr('y', (row: DataPointForPlot) => {
            return newY(row.y) - (scaleRadius(row.size) + 1);
          });
      });

    this.svg
      .append('rect')
      .attr('width', this.width)
      .attr('height', this.height)
      .style('fill', 'none')
      .style('pointer-events', 'fill')
      .attr('class', 'ZOOMRECT')
      .attr('z-index', 1)
      .lower()
      .call(zoom);

    this.scatter = this.svg
      .append('g')
      .attr('clip-path', 'url(#clip)')
      .attr('style', 'max-width: 100%; height: auto; height: intrinsic;');

    this.scatter
      .append('g')
      .selectAll('circle')
      .data(this.dataToPlot.data)
      .enter()
      .append('circle')
      .attr('cx', (row: DataPointForPlot) => {
        return xScale(row.x);
      })
      .attr('z-index', 2)
      .attr('cy', (row: DataPointForPlot) => {
        return yScale(row.y);
      })
      .attr('r', (row: DataPointForPlot) => {
        return scaleRadius(row.size);
      })
      .attr('fill', (row: DataPointForPlot) => {
        return row.color;
      })
      .style('cursor', 'pointer')
      .attr('id', 'POINT')
      .on('mouseover', (event: any, row: DataPointForPlot) => {
        this.tooltip.transition().duration(200).style('opacity', 1);
        const labelAdd = row.labelAdditional ? ` - ${row.labelAdditional}` : '';
        const toolTip = row.sizeLabel
          ? `
         ${row.label}${labelAdd}<br/>
         ${row.xLabel}: ${row.x.toLocaleString('en-US', { minimumFractionDigits: 2 })}<br/>
         ${row.yLabel}: ${row.y.toLocaleString('en-US', { minimumFractionDigits: 2 })}<br/>
         ${row.sizeLabel}: ${row.size.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          `
          : `
         ${row.label}${labelAdd}<br/>
         ${row.xLabel}: ${row.x.toLocaleString('en-US', { minimumFractionDigits: 2 })}<br/>
         ${row.yLabel}: ${row.y.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

        this.tooltip
          .html(toolTip)
          .style('left', event.pageX + 5 + 'px')
          .style('top', event.pageY - 5 + 'px')
          .style('color', row.color);
      })
      .on('mouseout', () => {
        this.tooltip.transition().duration(500).style('opacity', 0);
      })
      .exit();

    this.scatter
      .append('g')
      .selectAll('#LABEL')
      .data(this.dataToPlot.data)
      .enter()
      .append('text')
      .attr('z-index', 3)
      .text((row: DataPointForPlot) => {
        return row.label;
      })
      .attr('class', 'LABEL')
      .attr('fill', (row: DataPointForPlot) => {
        return row.color;
      })
      .attr('x', (row: DataPointForPlot) => {
        return xScale(row.x) + scaleRadius(row.size) + 1;
      })
      .attr('y', (row: DataPointForPlot) => {
        return yScale(row.y) - (scaleRadius(row.size) + 1);
      })
      .exit();
  }

  @Input()
  set data(dataToPlot: PlotData | undefined) {
    if (dataToPlot != null) {
      this.dataToPlot = dataToPlot;
      if (this.svg != null) {
        this.clearPlot();
        this.initSvg();
        this.plotData();
      }
    }
  }
}
