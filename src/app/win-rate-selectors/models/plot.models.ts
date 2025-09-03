import * as d3 from 'd3';

export type D3Selection = d3.Selection<SVGGElement, unknown, null, undefined>;
export type D3Event = d3.D3DragEvent<any, any, any> | MouseEvent;

export interface RawDataPoint {
  date: string;
  winRate: number;
  pickRate: number;
}

export interface DataPoint {
  date: Date;
  value: number;
  hero: string;
  map: string;
  rank: string;
  region: string;
}

export interface Scales {
  xScale: d3.ScaleTime<number, number>;
  yScale: d3.ScaleLinear<number, number>;
  colorScale: (key: string) => string;
  colorCategory: 'hero' | 'map' | 'rank' | 'region';
}

export interface LabelData {
  key: string;
  lastPoint: DataPoint;
  label: string;
  x: number;
  y: number;
}

export interface ChartDimensions {
  width: number;
  height: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  legendHeight: number;
  legendPadding: number;
}
