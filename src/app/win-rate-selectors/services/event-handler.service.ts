import { Injectable } from '@angular/core';
import { DataPoint } from '../models/plot.models';
import { GroupSelection, TooltipSelection } from '../models/d3-types';

@Injectable({
  providedIn: 'root'
})
export class EventHandlerService {
  highlightSeries(mainGroup: GroupSelection | null, key: string) {
    if (!mainGroup) return;

    // Dim all lines except the one matching the exact key
    mainGroup.selectAll<SVGPathElement, [string, DataPoint[]]>('.line')
      .style('opacity', d => d[0] === key ? 1 : 0.2)
      .style('stroke-width', d => d[0] === key ? '3px' : '2px');
  }

  unhighlightSeries(mainGroup: GroupSelection | null) {
    if (!mainGroup) return;

    // Reset all lines to full opacity
    mainGroup.selectAll('.line')
      .style('opacity', 1)
      .style('stroke-width', '2px');
  }

  showTooltip(
    tooltip: TooltipSelection | null,
    mainGroup: GroupSelection | null,
    point: DataPoint,
    scales: any,
    metric: string,
    xPos: number,
    yPos: number,
    height: number
  ) {
    if (!tooltip || !scales || !mainGroup) return;

    const formatValue = (value: number) => (value).toFixed(1) + '%';
    
    // Update tooltip content
    tooltip
      .style('opacity', 1)
      .html(`
        <div><strong>${point.hero}</strong></div>
        <div>Map: ${point.map}</div>
        <div>Rank: ${point.rank}</div>
        <div>Region: ${point.region}</div>
        <div>${metric}: ${formatValue(point.value)}</div>
        <div>Date: ${point.date.toLocaleDateString()}</div>
      `);

    // Update or create vertical line indicator
    const lineX = scales.xScale(point.date);
    
    // Remove any existing indicator line
    mainGroup.selectAll('.indicator-line').remove();
    
    // Add new indicator line
    mainGroup.append('line')
      .attr('class', 'indicator-line')
      .attr('x1', lineX)
      .attr('x2', lineX)
      .attr('y1', 0)
      .attr('y2', height)
      .style('stroke', '#666')
      .style('stroke-width', '1px')
      .style('stroke-dasharray', '3,3');

    this.moveTooltip(tooltip, xPos, yPos);
  }

  moveTooltip(tooltip: TooltipSelection | null, xPos: number, yPos: number) {
    if (!tooltip) return;
    
    tooltip
      .style('left', `${xPos}px`)
      .style('top', `${yPos}px`);
  }

  hideTooltip(tooltip: TooltipSelection | null, mainGroup: GroupSelection | null) {
    if (!tooltip || !mainGroup) return;
    tooltip.style('opacity', 0);
    mainGroup.selectAll('.indicator-line').remove();
  }
}
