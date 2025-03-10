export interface SalesData {
  id: string;
  product: string;
  category: string;
  region: string;
  sales: number;
  profit: number;
  date: string;
  representative: string;
}

export interface CustomCellRendererProps {
  value: any;
  data: SalesData;
}

export interface PerformanceMetrics {
  sales: number;
  profit: number;
  margin: number;
}