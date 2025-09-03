import { Selection } from 'd3';

export type BaseSelection<GElement extends Element> = Selection<GElement, unknown, null, undefined>;
export type SvgSelection = BaseSelection<SVGSVGElement>;
export type GroupSelection = BaseSelection<SVGGElement>;
export type TooltipSelection = BaseSelection<HTMLDivElement>;
