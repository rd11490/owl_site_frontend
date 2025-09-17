import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import * as d3 from 'd3';
import { WinRateData } from '../models';
import { MetricType } from './metric-selector.component';
import { DataPoint, Scales, ChartDimensions } from './models/plot.models';
import { D3UtilsService } from './services/d3-utils.service';
import { ScaleService } from './services/scale.service';
import { DataTransformService } from './services/data-transform.service';
import { EventHandlerService } from './services/event-handler.service';
import { SvgSelection, GroupSelection, TooltipSelection } from './models/d3-types';
import { PATCH_DATES, PatchInfo } from './models/patch-dates';

type D3Event = d3.D3DragEvent<any, any, any> | MouseEvent;
type LineDataType = [string, DataPoint[]];
type LineSelection = d3.Selection<SVGPathElement, LineDataType, SVGGElement, unknown>;

@Component({
  selector: 'win-rate-plot',
  templateUrl: './win-rate-plot.component.html',
  styleUrls: ['./win-rate-plot.component.css']
})
export class WinRatePlotComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  constructor(
    private d3Utils: D3UtilsService,
    private scaleService: ScaleService,
    private dataTransform: DataTransformService,
    private eventHandler: EventHandlerService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (this.initialized && (changes['data'] || changes['metric'])) {
      this.updatePlotWithErrorHandling();
    }
  }

  @ViewChild('container') containerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('svg') svgRef!: ElementRef<SVGElement>;
  @ViewChild('tooltip') tooltipRef!: ElementRef<HTMLDivElement>;

  @Input() data: WinRateData[] = [];
  @Input() metric: MetricType = 'Win Rate';
  private initialized = false;
  private resizeObserver: ResizeObserver | null = null;
  private resizeCallback: () => void = () => {};
  private updateTimeout: number | null = null;

  // D3 selections
  private svg!: SvgSelection;
  private mainGroup!: GroupSelection;
  private xAxis!: GroupSelection;
  private yAxis!: GroupSelection;
  private tooltip!: TooltipSelection;
  private scales: Scales | null = null;

  // D3 selections for legend
  private legend!: GroupSelection;

  // Chart dimensions
  private dimensions: ChartDimensions = {
    width: 0,
    height: 0,
    margin: { top: 20, right: 100, bottom: 70, left: 100 },
    legendHeight: 40,
    legendPadding: 10
  };

  ngOnInit() {
    this.resizeCallback = this.d3Utils.debounce(() => {
      this.updateDimensions();
      this.updatePlotWithErrorHandling();
      this.cdr.detectChanges();
    }, 100);

    this.resizeObserver = new ResizeObserver(this.resizeCallback);

    if (this.containerRef?.nativeElement) {
      this.resizeObserver.observe(this.containerRef.nativeElement);
    }
  }

  ngAfterViewInit() {
    this.initialized = false;
    this.updateDimensions();
    this.initializePlot();
    this.initialized = true;
    if (this.data.length > 0) {
      this.updatePlotWithErrorHandling();
    }
  }

  ngOnDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    
    if (this.updateTimeout) {
      window.clearTimeout(this.updateTimeout);
      this.updateTimeout = null;
    }

    this.tooltip?.remove();
  }

  private updateDimensions() {
    if (!this.containerRef?.nativeElement) return;

    const containerRect = this.containerRef.nativeElement.getBoundingClientRect();
    const baseHeight = 700;
    
    // Define fixed margins that account for axes, labels, and padding
    const margins = {
      top: this.dimensions.margin.top,
      right: this.dimensions.margin.right,
      bottom: this.dimensions.margin.bottom,
      left: this.dimensions.margin.left
    };

    // Calculate available space
    const availableWidth = containerRect.width;
    
    // Calculate plot dimensions ensuring we stay within bounds
    const plotWidth = Math.max(0, availableWidth - margins.left - margins.right);
    const plotHeight = Math.max(0, baseHeight - margins.top - margins.bottom);

    // Update dimensions object
    this.dimensions = {
      ...this.dimensions,
      width: plotWidth,
      height: plotHeight,
      margin: margins
    };

    // Size the entire SVG to match the container exactly
    if (this.svg) {
      this.svg
        .attr('width', availableWidth)
        .attr('height', baseHeight)
        .attr('viewBox', `0 0 ${availableWidth} ${baseHeight}`)
        .attr('preserveAspectRatio', 'xMinYMin');
    }

    // Position the main group with exact margins
    if (this.mainGroup) {
      this.mainGroup.attr('transform', `translate(${margins.left},${margins.top})`);
    }

    // Update the scales to use the new plot dimensions
    if (this.scales) {
      this.scales.xScale.range([0, plotWidth]);
      this.scales.yScale.range([plotHeight, 0]);
    }

    console.log('Plot dimensions:', {
      container: { width: availableWidth, height: containerRect.height },
      margins,
      plot: { width: plotWidth, height: plotHeight },
      total: { width: availableWidth, height: baseHeight }
    });
  }

  private initializePlot() {
    if (!this.svgRef?.nativeElement || !this.tooltipRef?.nativeElement) return;

    const svgElement = this.svgRef.nativeElement as SVGSVGElement;
    const tooltipElement = this.tooltipRef.nativeElement;

    this.svg = d3.select(svgElement) as SvgSelection;
    this.mainGroup = this.svg.append('g')
      .attr('class', 'main-group')
      .attr('transform', `translate(${this.dimensions.margin.left},${this.dimensions.margin.top})`) as GroupSelection;

    this.initializeBackground();
    this.initializeAxes();

    this.tooltip = d3.select(tooltipElement) as TooltipSelection;
    this.tooltip.style('opacity', 0);

    try {
      this.scales = this.scaleService.initializeScales(
        this.dimensions.width,
        this.dimensions.height,
        this.data
      );
    } catch (error) {
      console.error('Error initializing scales:', error);
      // Set default scales if initialization fails
      this.scales = {
        xScale: d3.scaleTime().range([0, this.dimensions.width]),
        yScale: d3.scaleLinear().range([this.dimensions.height, 0]),
        colorScale: () => '#808080',
        colorCategory: 'hero'
      };
    }

    // Initialize the legend group
    this.legend = this.svg.append('g')
      .attr('class', 'legend-group') as GroupSelection;
  }

  private initializeBackground() {
    this.mainGroup.append('rect')
      .attr('class', 'plot-background')
      .attr('width', '90%')
      .attr('height', '90%')
      .attr('fill', 'white');
    
    this.mainGroup.append('rect')
      .attr('class', 'axis-background')
      .attr('x', 0)
      .attr('y', this.dimensions.height)
      .attr('width', this.dimensions.width)
      .attr('height', this.dimensions.margin.bottom)
      .attr('fill', 'white');
  }

  private initializeAxes() {
    this.xAxis = this.mainGroup.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${this.dimensions.height})`);

    this.yAxis = this.mainGroup.append('g')
      .attr('class', 'y-axis');
  }

  private updatePlotWithErrorHandling() {
    try {
      this.updatePlot();
    } catch (error) {
      console.error('Error updating plot:', error);
      // Reset plot state if update fails
      this.mainGroup.selectAll('.line').remove();
      this.tooltip.style('opacity', 0);
    }
  }

  private getCommonElements(data: Map<string, DataPoint[]>): { 
    commonElements: string[], 
    uniqueLabels: Map<string, string>,
    plotTitle: string 
  } {
    // Get the original WinRateData array from this._data
    const entries = this.data;
    console.log('Processing entries:', entries);
    
    // Find common elements by checking if all entries have the same value
    const commonElements: string[] = [];
    
    // Define the string properties we want to check
    type StringProperties = 'hero' | 'map' | 'rank' | 'region';
    const propertiesToCheck: StringProperties[] = ['hero', 'map', 'rank', 'region'];
    
    // Helper to check if a property is common across all entries
    const isCommon = (prop: StringProperties): boolean => {
      if (entries.length === 0) return false;
      const firstValue = entries[0][prop];
      return entries.every((entry: WinRateData) => entry[prop] === firstValue);
    };

    // Check each property and add to common elements if it's common
    propertiesToCheck.forEach(prop => {
      if (isCommon(prop)) {
        commonElements.push(entries[0][prop]);
      }
    });

    console.log('Common elements:', commonElements);
    
    // Create unique labels for each series
    const uniqueLabels = new Map<string, string>();
    const keys = Array.from(data.keys());
    
    entries.forEach((entry: WinRateData, index: number) => {
      const labelParts: string[] = [];
      
      // Check each property and add to label if it's not common
      propertiesToCheck.forEach((prop: StringProperties) => {
        if (!commonElements.includes(entry[prop])) {
          labelParts.push(entry[prop]);
        }
      });
      
      uniqueLabels.set(keys[index], labelParts.join(' - '));
    });

    // Helper to format map names
    const formatMapName = (mapName: string): string => {
      if (mapName === 'all-maps') return 'All Maps';
      // Split by hyphen, capitalize each word, join with space
      return mapName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    };

    // Format common elements for display
    const formatForDisplay = (element: string, type: StringProperties): string => {
      switch (type) {
        case 'map':
          return formatMapName(element);
        case 'rank':
          return element === 'All' ? 'All Ranks' : element;
        default:
          return element;
      }
    };

    // Format common elements for the title
    const formattedCommonElements = commonElements.map((element, index) => {
      // Find which property this element came from by checking the first entry
      const prop = propertiesToCheck.find(p => entries[0][p] === element);
      return prop ? formatForDisplay(element, prop) : element;
    });

    // Create plot title from formatted common elements
    const plotTitle = [...formattedCommonElements, this.metric]
      .filter(element => element && element.trim() !== '')
      .join(' - ')
      .replace(/\s*-\s*-\s*/g, ' - ')
      .trim();

    // Create unique labels with proper formatting
    const formattedUniqueLabels = new Map<string, string>();
    entries.forEach((entry: WinRateData, index: number) => {
      const labelParts: string[] = [];
      
      // Check each property and add formatted value to label if it's not common
      propertiesToCheck.forEach((prop: StringProperties) => {
        if (!commonElements.includes(entry[prop])) {
          labelParts.push(formatForDisplay(entry[prop], prop));
        }
      });
      
      formattedUniqueLabels.set(keys[index], labelParts.join(' - '));
    });

    console.log('Plot title:', plotTitle);
    console.log('Formatted unique labels:', Object.fromEntries(formattedUniqueLabels));
    
    return {
      commonElements: formattedCommonElements,
      uniqueLabels: formattedUniqueLabels,
      plotTitle
    };
  }

  private updatePlot() {
    if (!this.data || !this.scales) return;

    const data = this.dataTransform.transformData(this.data, this.metric);
    console.log('data', data)
    const allDataPoints = Array.from(data.values()).flat();
    if (allDataPoints.length === 0) return;

    // Update scales first
    this.scaleService.updateScales(this.scales, data);
    
    // Get common elements and create plot title
    const { uniqueLabels, plotTitle } = this.getCommonElements(data);
    
    // Update legend before axes and lines as it affects layout
    this.updateLegend(data, uniqueLabels, plotTitle);
    
    // Update the main plot components
    this.updateAxes();
    this.drawPatchLines(); // Draw patch lines before the data lines
    this.updateLines(data, allDataPoints);
  }

  private drawPatchLines() {
    if (!this.scales?.xScale) return;

    // Remove existing patch lines
    this.mainGroup.selectAll('.patch-line-group').remove();

    // Create a group for each patch line
    const patchLineGroups = this.mainGroup.selectAll('.patch-line-group')
      .data(PATCH_DATES)
      .enter()
      .append('g')
      .attr('class', 'patch-line-group');

    // Draw the lines and add interaction
    patchLineGroups.each((patchInfo: PatchInfo, i: number, groups: SVGGElement[] | ArrayLike<SVGGElement>) => {
      const group = d3.select(groups[i]);
      const patchDate = new Date(patchInfo.date);
      
      // Calculate the midpoint position
      const nextDay = new Date(patchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      const midPoint = new Date((patchDate.getTime() + nextDay.getTime()) / 2);

      // Draw the vertical line
      const line = group.append('line')
        .attr('class', 'patch-line')
        .attr('x1', this.scales!.xScale(midPoint))
        .attr('x2', this.scales!.xScale(midPoint))
        .attr('y1', 0)
        .attr('y2', this.dimensions.height)
        .style('stroke', 'rgba(128, 128, 128, 0.5)')
        .style('stroke-width', '2px')
        .style('stroke-dasharray', '4,4');

      // Add mouse event handlers for the tooltip
      group
        .on('mouseover', (event: MouseEvent) => {
          // Highlight the line on hover
          line.style('stroke', 'rgba(128, 128, 128, 0.8)')
              .style('stroke-width', '3px');

          // Show tooltip using the event handler service
          const svgRect = this.svg.node()?.getBoundingClientRect();
          if (svgRect) {
            this.eventHandler.showPatchTooltip(
              this.tooltip,
              this.mainGroup,
              patchInfo,
              event.clientX - svgRect.left + 10,
              event.clientY - svgRect.top - 10
            );
          }
        })
        .on('mousemove', (event: MouseEvent) => {
          const svgRect = this.svg.node()?.getBoundingClientRect();
          if (svgRect) {
            this.eventHandler.moveTooltip(
              this.tooltip,
              event.clientX - svgRect.left + 10,
              event.clientY - svgRect.top - 10
            );
          }
        })
        .on('mouseout', () => {
          this.eventHandler.hideTooltip(this.tooltip, this.mainGroup);
          
          // Reset line style
          line.style('stroke', 'rgba(128, 128, 128, 0.5)')
              .style('stroke-width', '2px');
        });

      // Add an invisible wider line for easier hovering
      group.append('line')
        .attr('class', 'patch-line-hover')
        .attr('x1', this.scales!.xScale(midPoint))
        .attr('x2', this.scales!.xScale(midPoint))
        .attr('y1', 0)
        .attr('y2', this.dimensions.height)
        .style('stroke', 'transparent')
        .style('stroke-width', '10px'); // Wide invisible line for easier hovering
    });
  }

  private updateAxes() {
    if (!this.scales) return;

    const xAxisTransition = (this.xAxis as GroupSelection)
      .transition()
      .duration(300);

    const yAxisTransition = (this.yAxis as GroupSelection)
      .transition()
      .duration(300);

    // Get unique dates from transformed data
    const transformedData = this.dataTransform.transformData(this.data, this.metric);
    const allDates = new Set<Date>();
    
    // Collect all dates from all series
    Array.from(transformedData.values()).forEach(points => {
      points.forEach(point => allDates.add(point.date));
    });
    
    // Sort dates chronologically
    const sortedDates = Array.from(allDates).sort((a, b) => a.getTime() - b.getTime());

    xAxisTransition.call(d3.axisBottom(this.scales.xScale)
      .tickValues(sortedDates)
      .tickFormat((d: any) => {
        const date = d as Date;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }));

    // Adjust x-axis tick labels
    this.xAxis.selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');

    yAxisTransition.call(d3.axisLeft(this.scales.yScale)
      .ticks(10)
      .tickFormat(d => `${d}%`));

    this.updateAxisLabels();
  }

  private updateAxisLabels() {
    const updateLabel = (
      selection: GroupSelection,
      className: string,
      x: number,
      y: number,
      transform: string | null,
      text: string
    ) => {
      selection.selectAll(`.${className}`).remove();
      selection
        .append('text')
        .attr('class', className)
        .attr('x', x)
        .attr('y', y)
        .style('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('fill', 'black')
        .attr('transform', transform || null)
        .text(text);
    };

    updateLabel(
      this.xAxis,
      'x-axis-label',
      this.dimensions.width / 2,
      this.dimensions.margin.bottom - 5,
      null,
      'Date'
    );

    updateLabel(
      this.yAxis,
      'y-axis-label',
      -this.dimensions.height / 2,
      -this.dimensions.margin.left + 20,
      'rotate(-90)',
      this.metric === 'Win Rate' ? 'Win Rate (%)' : 'Pick Rate (%)'
    );
  }

  private updateLines(data: Map<string, DataPoint[]>, allDataPoints: DataPoint[]) {
    if (!this.scales) return;

    const line = this.d3Utils.createLineGenerator(this.scales.xScale, this.scales.yScale);
    const linesGroup = this.getOrCreateLinesGroup();
    
    // Update lines
    const lines = linesGroup.selectAll<SVGPathElement, LineDataType>('.line')
      .data(Array.from(data.entries()));

    lines.exit()
      .transition()
      .duration(300)
      .style('opacity', 0)
      .remove();

    const linesEnter = lines.enter()
      .append('path')
      .attr('class', d => `line line-${d[0].replace(/[^a-zA-Z0-9]/g, '-')}`)
      .attr('fill', 'none')
      .attr('stroke-width', '2px')
      .style('opacity', 0);

    const mergedLines = lines.merge(linesEnter) as LineSelection;
    
    mergedLines
      .attr('stroke', d => this.scales!.colorScale(d[0]))
      .transition()
      .duration(500)
      .style('opacity', 1)
      .attr('d', d => line(d[1]));

    const self = this;
    // Add points for each data point
    Array.from(data.entries()).forEach(([key, points]) => {
      const pointsGroup = linesGroup.selectAll(`.points-${key.replace(/[^a-zA-Z0-9]/g, '-')}`)
        .data([points])
        .join('g')
        .attr('class', `points-${key.replace(/[^a-zA-Z0-9]/g, '-')}`);

      const dots = pointsGroup.selectAll<SVGCircleElement, DataPoint>('circle')
        .data(points);

      dots.exit().remove();

      const dotsEnter = dots.enter()
        .append('circle')
        .attr('r', 4)
        .attr('fill', self.scales!.colorScale(key))
        .attr('stroke', 'white')
        .attr('stroke-width', '1px')
        .style('opacity', 0);

      dots.merge(dotsEnter)
        .transition()
        .duration(500)
        .attr('cx', d => self.scales!.xScale(d.date))
        .attr('cy', d => self.scales!.yScale(d.value))
        .style('opacity', 1);

      // Add hover interactions for points
      pointsGroup.selectAll<SVGCircleElement, DataPoint>('circle')
        .on('mouseover', function(this: SVGCircleElement, event: MouseEvent, d: DataPoint) {
          d3.select(this)
            .transition()
            .duration(100)
            .attr('r', 6)
            .attr('stroke-width', '2px');

          self.eventHandler.showTooltip(
            self.tooltip,
            self.mainGroup,
            d,
            self.scales!,
            self.metric,
            event.clientX - self.svg.node()!.getBoundingClientRect().left + 10,
            event.clientY - self.svg.node()!.getBoundingClientRect().top - 10,
            self.dimensions.height
          );
        })
        .on('mouseout', function(this: SVGCircleElement) {
          d3.select(this)
            .transition()
            .duration(100)
            .attr('r', 4)
            .attr('stroke-width', '1px');

          self.eventHandler.hideTooltip(self.tooltip, self.mainGroup);
        });
    });

    this.setupLineInteractions(mergedLines);
  }

  private getOrCreateLinesGroup(): GroupSelection {
    const selection = this.mainGroup.selectAll<SVGGElement, unknown>('.lines-group');
    return selection.data([null])
      .join('g')
      .attr('class', 'lines-group') as unknown as GroupSelection;
  }

  private setupLineInteractions(lines: LineSelection) {
    const that = this;

    const handleMouseMove = (event: MouseEvent, d: LineDataType) => {
      if (!d[1].length || !that.svg || !that.scales) return;

      const node = that.svg.node();
      if (!node) return;

      const svgRect = node.getBoundingClientRect();
      const mouseX = event.clientX - svgRect.left;

      const nearestPoint = that.dataTransform.findNearestPoint(
        mouseX,
        d[1],
        that.scales.xScale
      );
      
      that.eventHandler.showTooltip(
        that.tooltip,
        that.mainGroup,
        nearestPoint,
        that.scales,
        that.metric,
        event.clientX - svgRect.left + 10,
        event.clientY - svgRect.top - 10,
        that.dimensions.height
      );
    };

    lines
      .on('mouseover', (event: MouseEvent, d: LineDataType) => {
        that.eventHandler.highlightSeries(that.mainGroup, d[0]);
      })
      .on('mousemove', handleMouseMove)
      .on('mouseout', () => {
        that.eventHandler.unhighlightSeries(that.mainGroup);
        that.eventHandler.hideTooltip(that.tooltip, that.mainGroup);
      });
  }

  private updateLegend(data: Map<string, DataPoint[]>, uniqueLabels: Map<string, string>, plotTitle: string) {
    if (!this.scales) return;

    // Get legend items and use our unique labels from getCommonElements
    const legendItems = this.scaleService.getLegendItems(data)
      .map(item => {
        // Use the unique label we created in getCommonElements
        const uniqueLabel = uniqueLabels.get(item.key) || item.key;
        return {
          ...item,
          key: uniqueLabel
        };
      })
      .sort((a, b) => {
        // Custom sort order for ranks if they contain rank information
        const rankOrder = ['Grandmaster', 'Master', 'Diamond', 'Platinum', 'Gold', 'Silver', 'Bronze'];
        const aRank = rankOrder.find(rank => a.key.includes(rank));
        const bRank = rankOrder.find(rank => b.key.includes(rank));
        if (aRank && bRank) {
          return rankOrder.indexOf(aRank) - rankOrder.indexOf(bRank);
        }
        // If no ranks found, sort alphabetically
        return a.key.localeCompare(b.key);
      })
      .filter(item => item.key && item.key.trim().length > 0); // Remove any empty labels
    
    // Calculate dimensions first
    const svgWidth = this.svg.node()?.getBoundingClientRect().width || 0;
    
    // Clear all existing elements
    this.svg.selectAll('.plot-title').remove();
    this.legend.selectAll('*').remove();

    // Constants for spacing
    const titleHeight = 30; // Increased height for the title
    const titleSpacing = 20; // Increased spacing between title and legend
    const itemHeight = 20;
    const itemWidth = Math.min(150, this.dimensions.width / 3);
    const symbolSize = 10;
    const itemsPerRow = Math.max(1, Math.floor((this.dimensions.width - this.dimensions.margin.left - this.dimensions.margin.right) / itemWidth));
    const rowCount = Math.ceil(legendItems.length / itemsPerRow);
    const totalLegendHeight = rowCount * itemHeight + this.dimensions.legendPadding * 2;
    const totalHeaderHeight = titleHeight + titleSpacing + totalLegendHeight;

    // Create and position title first
    this.svg.append('g')
      .attr('class', 'plot-title')
      .attr('transform', `translate(${svgWidth / 2},${this.dimensions.margin.top})`)
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'hanging')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .call(text => {
        if (plotTitle.length > 50) {
          const midPoint = Math.floor(plotTitle.split(' - ').length / 2);
          const titleParts = plotTitle.split(' - ');
          const firstLine = titleParts.slice(0, midPoint).join(' - ');
          const secondLine = titleParts.slice(midPoint).join(' - ');
          
          text.append('tspan')
            .attr('x', 0)
            .attr('dy', 0)
            .text(firstLine);
          
          text.append('tspan')
            .attr('x', 0)
            .attr('dy', '1.2em')
            .text(secondLine);
        } else {
          text.text(plotTitle);
        }
      });

    // Position legend below title
    const legendY = this.dimensions.margin.top + titleHeight + titleSpacing;
    const legendAvailableWidth = svgWidth - (this.dimensions.margin.left + this.dimensions.margin.right);
    const totalWidth = Math.min(legendAvailableWidth, itemsPerRow * itemWidth);
    const startX = this.dimensions.margin.left + (legendAvailableWidth - totalWidth) / 2;

    // Create legend items
    const legendGroup = this.legend
      .attr('transform', `translate(${startX},${legendY})`);

    // Add legend items with proper spacing
    legendItems.forEach((item, i) => {
      const row = Math.floor(i / itemsPerRow);
      const col = i % itemsPerRow;
      const x = col * itemWidth;
      const y = row * itemHeight;

      const itemGroup = legendGroup.append('g')
        .attr('class', 'legend-item')
        .attr('transform', `translate(${x},${y})`);

      itemGroup.append('rect')
        .attr('width', symbolSize)
        .attr('height', symbolSize)
        .attr('fill', item.color);

      itemGroup.append('text')
        .attr('x', symbolSize + 5)
        .attr('y', symbolSize - 2)
        .style('font-size', '12px')
        .text(item.key);
    });

    // Move the main plot area down
    this.mainGroup.attr('transform', `translate(${this.dimensions.margin.left},${this.dimensions.margin.top + totalHeaderHeight})`);

    // Create legend items with proper spacing
    const items = legendGroup.selectAll('.legend-item')
      .data(legendItems)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => {
        const row = Math.floor(i / itemsPerRow);
        const col = i % itemsPerRow;
        return `translate(${col * itemWidth},${row * itemHeight})`;
      });

    // Add colored rectangles
    items.append('rect')
      .attr('width', symbolSize)
      .attr('height', symbolSize)
      .attr('y', -symbolSize)
      .attr('fill', d => d.color);

    // Add text labels
    items.append('text')
      .attr('x', symbolSize + 5)
      .attr('y', 0)
      .text(d => d.key)
      .attr('font-size', '12px')
      .attr('alignment-baseline', 'middle');
  }
}
