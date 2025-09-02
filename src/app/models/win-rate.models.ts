export interface WinRateData {
    id: string;
    data: {
        date: string;
        winRate: number;
        pickRate: number;
    }[];
    metadata: {
        hero?: string;
        map?: string;
        rank?: string;
        region?: string;
    };
}
