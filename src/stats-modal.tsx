export interface Stats {
    eases: Record<number, number>;
    intervals: Record<number, number>;
    newCount: number;
    youngCount: number;
    matureCount: number;
}