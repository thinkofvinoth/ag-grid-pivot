import React from 'react';
import { CustomCellRendererProps } from '../types/grid';

export const ProfitCellRenderer: React.FC<CustomCellRendererProps> = ({ value }) => {
  if (value == null) return <div>-</div>;
  
  const isPositive = value > 0;
  return (
    <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
      {isPositive ? '+' : ''}{value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
    </div>
  );
};

export const SalesCellRenderer: React.FC<CustomCellRendererProps> = ({ value }) => {
  if (value == null) return <div>-</div>;
  
  return (
    <div className="font-semibold">
      {value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
    </div>
  );
};

export const CombinedInfoRenderer: React.FC<CustomCellRendererProps> = ({ value }) => {
  if (!value) return <div>-</div>;

  const { sales, profit, margin } = value;
  
  return (
    <div className="flex flex-col gap-1 text-sm">
      <div>
        Sales: <span className="font-semibold">
          {sales.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
        </span>
      </div>
      <div>
        Profit: <span className={`font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {profit.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
        </span>
      </div>
      <div>
        Margin: <span className="font-semibold">
          {margin.toFixed(2)}%
        </span>
      </div>
    </div>
  );
};