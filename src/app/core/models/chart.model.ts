export interface PieChartData {
  name: string;
  value: number;
}

export interface PieChartSelectEvent {
  name: string;
  value: number;
}

export interface ChartSeries {
  name: string;
  series: SeriesPoint[];
}

export interface SeriesPoint {
  name: string;
  value: number;
}
