export interface WinRateRequest {
    ranks?: string[];
    regions?: string[];
    maps?: string[];
    heroes?: string[];
    dateRange?: {
        min: string;
        max: string;
    };
    metric: string;
}
