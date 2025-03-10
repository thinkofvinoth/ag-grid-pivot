import React, { useCallback, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { 
  ColDef, 
  GridReadyEvent,
  GridApi,
  ColumnApi,
  ValueGetterParams,
  ValueFormatterParams,
  ICellRendererParams
} from 'ag-grid-community';
import { debounce } from 'lodash';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'ag-grid-enterprise';

// Custom Cell Renderers
const ProfitCellRenderer: React.FC<{ value: number }> = ({ value }) => {
  if (value == null) return <div>-</div>;
  
  const isPositive = value > 0;
  return (
    <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
      {isPositive ? '+' : ''}{value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
    </div>
  );
};

const SalesCellRenderer: React.FC<{ value: number }> = ({ value }) => {
  if (value == null) return <div>-</div>;
  
  return (
    <div className="font-semibold">
      {value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
    </div>
  );
};

const CombinedInfoRenderer: React.FC<{ value: { sales: number; profit: number; margin: number } }> = ({ value }) => {
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

// Sample Data
const sampleData = [
  {
    id: '1',
    date: '2024-03-01',
    product: 'Laptop Pro',
    category: 'Electronics',
    region: 'North',
    sales: 2500,
    profit: 750,
    representative: 'John Smith'
  },
  {
    id: '2',
    date: '2024-03-02',
    product: 'Office Chair',
    category: 'Furniture',
    region: 'South',
    sales: 450,
    profit: 125,
    representative: 'Sarah Johnson'
  },
  {
    id: '3',
    date: '2024-03-03',
    product: 'Desk Lamp',
    category: 'Accessories',
    region: 'East',
    sales: 75,
    profit: 25,
    representative: 'Mike Brown'
  },
  {
    id: '4',
    date: '2024-03-04',
    product: 'Laptop Pro',
    category: 'Electronics',
    region: 'West',
    sales: 2500,
    profit: -150,
    representative: 'Lisa Davis'
  },
  {
    id: '5',
    date: '2024-03-05',
    product: 'Standing Desk',
    category: 'Furniture',
    region: 'North',
    sales: 899,
    profit: 299,
    representative: 'John Smith'
  }
];

const SalesGrid: React.FC = () => {
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [columnApi, setColumnApi] = useState<ColumnApi | null>(null);
  const [isPivotMode, setIsPivotMode] = useState(false);
  const [recordLimit, setRecordLimit] = useState<number>(10);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    floatingFilter: true,
    enablePivot: true,
    enableRowGroup: true,
    enableValue: true,
  }), []);

  const columnDefs = useMemo<ColDef[]>(() => [
    {
      field: 'date',
      filter: 'agDateColumnFilter',
      valueFormatter: (params: ValueFormatterParams) => 
        params.value ? new Date(params.value).toLocaleDateString() : '-',
      filterParams: {
        buttons: ['reset', 'apply'],
        closeOnApply: true
      }
    },
    { 
      field: 'product',
      rowGroup: isPivotMode,
      enableRowGroup: true,
      enablePivot: true,
      filter: 'agTextColumnFilter',
      filterParams: {
        filterOptions: ['contains', 'notContains', 'equals', 'notEqual'],
        defaultOption: 'contains'
      }
    },
    { 
      field: 'category',
      pivot: isPivotMode,
      enablePivot: true
    },
    { 
      field: 'region',
      enablePivot: true
    },
    {
      field: 'sales',
      cellRenderer: SalesCellRenderer,
      aggFunc: 'sum',
      enableValue: true,
      valueFormatter: (params: ValueFormatterParams) => 
        params.value != null ? params.value.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '-',
      filter: 'agNumberColumnFilter',
      filterParams: {
        buttons: ['apply', 'reset'],
        closeOnApply: true
      }
    },
    {
      field: 'profit',
      cellRenderer: ProfitCellRenderer,
      aggFunc: 'sum',
      enableValue: true,
      valueFormatter: (params: ValueFormatterParams) => 
        params.value != null ? params.value.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '-',
      filter: 'agNumberColumnFilter'
    },
    { 
      field: 'representative',
      enablePivot: true,
      filter: 'agTextColumnFilter'
    },
    {
      headerName: 'Performance Metrics',
      field: 'performanceMetrics',
      valueGetter: (params: ValueGetterParams) => {
        const sales = params.data?.sales || 0;
        const profit = params.data?.profit || 0;
        const margin = sales > 0 ? (profit / sales) * 100 : 0;
        return { sales, profit, margin };
      },
      cellRenderer: CombinedInfoRenderer,
      filter: false,
      sortable: false,
      width: 200
    },
    {
      headerName: 'Actions',
      field: 'actions',
      cellRenderer: (params: ICellRendererParams) => (
        <button 
          onClick={() => handleDeepLink(params.data)}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          View Details
        </button>
      ),
      filter: false,
      sortable: false,
      width: 120
    }
  ], [isPivotMode]);

  const handleDeepLink = useCallback((data: any) => {
    console.log('Deep link clicked:', data);
    alert(`Viewing details for ${data.product} - ${data.date}`);
  }, []);

  const sideBar = useMemo(() => ({
    toolPanels: [
      {
        id: 'columns',
        labelDefault: 'Columns',
        labelKey: 'columns',
        iconKey: 'columns',
        toolPanel: 'agColumnsToolPanel',
      },
      {
        id: 'filters',
        labelDefault: 'Filters',
        labelKey: 'filters',
        iconKey: 'filter',
        toolPanel: 'agFiltersToolPanel',
      },
    ],
    defaultToolPanel: 'columns',
  }), []);

  const onGridReady = useCallback((params: GridReadyEvent) => {
    setGridApi(params.api);
    setColumnApi(params.columnApi);
    
    const savedState = localStorage.getItem('gridColumnState');
    if (savedState) {
      params.columnApi.applyColumnState(JSON.parse(savedState));
    }
  }, []);

  const onColumnChanged = useCallback(debounce(() => {
    if (columnApi) {
      const columnState = columnApi.getColumnState();
      localStorage.setItem('gridColumnState', JSON.stringify(columnState));
    }
  }, 1000), [columnApi]);

  const handleRecordLimitChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const limit = parseInt(event.target.value, 10);
    setRecordLimit(limit);
    if (gridApi) {
      gridApi.paginationSetPageSize(limit);
    }
  }, [gridApi]);

  const togglePivotMode = useCallback(() => {
    setIsPivotMode(prev => !prev);
    if (gridApi) {
      gridApi.refreshHeader();
    }
  }, [gridApi]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={togglePivotMode}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isPivotMode
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {isPivotMode ? 'Disable Pivot Mode' : 'Enable Pivot Mode'}
          </button>
          
          <div className="flex items-center gap-2">
            <label htmlFor="recordLimit" className="text-sm font-medium text-gray-700">
              Records per page:
            </label>
            <select
              id="recordLimit"
              value={recordLimit}
              onChange={handleRecordLimitChange}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="ag-theme-alpine w-full h-[600px]">
        <AgGridReact
          rowData={sampleData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          sideBar={sideBar}
          enableRangeSelection={true}
          rowSelection="multiple"
          pivotMode={isPivotMode}
          rowGroupPanelShow="always"
          pivotPanelShow="always"
          pagination={true}
          paginationPageSize={recordLimit}
          rowBuffer={10}
          cacheBlockSize={100}
          animateRows={true}
          onGridReady={onGridReady}
          onColumnChanged={onColumnChanged}
          tooltipShowDelay={0}
          tooltipHideDelay={2000}
          enableCharts={true}
          statusBar={{
            statusPanels: [
              { statusPanel: 'agTotalRowCountComponent', align: 'left' },
              { statusPanel: 'agFilteredRowCountComponent' },
              { statusPanel: 'agSelectedRowCountComponent' },
              { statusPanel: 'agAggregationComponent' },
            ],
          }}
          loadingOverlayComponent={() => (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}
          overlayNoRowsTemplate={
            '<div class="p-4 text-gray-500">No data available</div>'
          }
        />
      </div>
    </div>
  );
};

export default SalesGrid;