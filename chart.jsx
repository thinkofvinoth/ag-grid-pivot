import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { ChevronDown } from 'lucide-react';

const chartTypesList = [
  'line', 'spline', 'area', 'column', 'bar', 'pie',
  'bubble', 'grid'
];

const chartColors = [
  '#2E93fA', '#E91E63', '#546E7A', '#FF9800', 
  '#775DD0', '#2563EB', '#FEB019', '#FF4560',
  '#4B5563', '#00BCD4', '#FF5722', '#9333EA'
];

const sampleData = [
  {
    title: "Blackrock STP Percentages for Last 4 Months",
    yAxisTitle: "STP Percentages",
    data: {
      months: ["December 2024", "January 2025", "February 2025", "March 2025"],
      STP_Percentages: [99.91, 99.93, 99.81, 99.81]
    }
  },
  {
    chartType: "bar",
    title: "Blackrock STP and Non-STP Percentages for Last 4 Months",
    yAxisTitle: "Percentage",
    data: [
      { month: "November 2024", STP: 99.86, "Non-STP": 0.14 },
      { month: "December 2024", STP: 99.91, "Non-STP": 0.09 },
      { month: "January 2025", STP: 99.93, "Non-STP": 0.07 },
      { month: "February 2025", STP: 99.81, "Non-STP": 0.19 }
    ]
  },
  {
    chartType: "pie",
    title: "Blackrock STP Percentages for Last 4 Months",
    yAxisTitle: "STP Percentage",
    data: {
      "November 2024": 99.86,
      "December 2024": 99.91,
      "January 2025": 99.93,
      "February 2025": 99.81,
      "March 2025": 99.81
    }
  }
];

const DynamicChart = ({ chartData, chartType: initialChartType = 'bar' }) => {
  const [selectedChartType, setSelectedChartType] = React.useState(
    chartData.chartType || initialChartType
  );

  const processData = (data) => {
    const isGridOrHeatmap = selectedChartType === 'grid' || selectedChartType === 'heatmap';
    const isTreemap = selectedChartType === 'treemap';

    if (isGridOrHeatmap) {
      const { xCategories, yCategories, processedData } = processGridData(data);
      return { xCategories, yCategories, series: [processedData] };
    }

    if (isTreemap) {
      return { series: [processTreemapData(data)] };
    }

    return processRegularData(data);
  };

  const processGridData = (data) => {
    const xCategories = Array.isArray(data) 
      ? [...new Set(data.map(item => Object.values(item)[0].toString()))]
      : Object.keys(data);
    
    const yCategories = Array.isArray(data)
      ? Object.keys(data[0]).filter(key => typeof data[0][key] === 'number')
      : [];

    const processedData = {
      type: 'heatmap',
      data: Array.isArray(data)
        ? data.flatMap((item, rowIndex) => 
            yCategories.map((key, colIndex) => ({
              x: rowIndex,
              y: colIndex,
              value: Number(item[key]) || 0,
              name: `${xCategories[rowIndex]} - ${key}`
            }))
          )
        : Object.entries(data).map(([key, value], index) => ({
            x: index % Math.ceil(Math.sqrt(Object.keys(data).length)),
            y: Math.floor(index / Math.ceil(Math.sqrt(Object.keys(data).length))),
            value: Number(value),
            name: key
          })),
      dataLabels: {
        enabled: true,
        color: '#000000',
        style: { textOutline: 'none', fontSize: '12px' },
        format: '{point.value:.1f}%'
      },
      borderWidth: 1,
      borderColor: '#FFFFFF'
    };

    return { xCategories, yCategories, processedData };
  };

  const processTreemapData = (data) => ({
    type: 'treemap',
    data: Array.isArray(data)
      ? data.map((item, index) => ({
          name: Object.values(item)[0].toString(),
          value: Object.values(item).find(val => typeof val === 'number'),
          colorValue: Object.values(item).find(val => typeof val === 'number'),
          color: chartColors[index % chartColors.length]
        }))
      : Object.entries(data).map(([key, value], index) => ({
          name: key,
          value: Number(value),
          colorValue: Number(value),
          color: chartColors[index % chartColors.length]
        }))
  });

  const processRegularData = (data) => {
    if (Array.isArray(data)) {
      const xAxisKey = Object.keys(data[0])[0];
      const categories = data.map(item => String(item[xAxisKey]));
      const dataKeys = Object.keys(data[0]).filter(key => key !== xAxisKey);
      
      const series = dataKeys.map((key, index) => ({
        name: key.replace(/_/g, ' '),
        type: selectedChartType === 'stackbar' ? 'bar' : selectedChartType,
        color: chartColors[index % chartColors.length],
        stacking: selectedChartType === 'stackbar' ? 'normal' : undefined,
        data: data.map(item => Number(item[key]) || 0)
      }));

      return { categories, series };
    }

    const categories = Object.keys(data);
    const series = Array.isArray(Object.values(data)[0])
      ? Object.entries(data).map(([key, values], index) => ({
          name: key.replace(/_/g, ' '),
          type: selectedChartType === 'stackbar' ? 'bar' : selectedChartType,
          color: chartColors[index % chartColors.length],
          stacking: selectedChartType === 'stackbar' ? 'normal' : undefined,
          data: values
        }))
      : [{
          name: chartData.yAxisTitle || 'Value',
          type: selectedChartType === 'pie' ? 'pie' : selectedChartType,
          color: chartColors[0],
          data: selectedChartType === 'pie'
            ? categories.map((cat, index) => ({
                name: cat,
                y: Number(data[cat]),
                color: chartColors[index % chartColors.length]
              }))
            : Object.values(data).map(Number)
        }];

    return { categories, series };
  };

  const getChartOptions = () => {
    const { title, yAxisTitle, data } = chartData;
    const processedData = processData(data);

    const baseOptions = {
      chart: {
        type: selectedChartType === 'stackbar' ? 'bar' : 
              selectedChartType === 'grid' ? 'heatmap' : 
              selectedChartType,
        backgroundColor: '#FFFFFF',
        style: {
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        }
      },
      title: {
        text: title,
        style: { fontSize: '18px', fontWeight: 'bold', color: '#2C3E50' }
      },
      credits: { enabled: false },
      tooltip: {
        shared: true,
        valueDecimals: 2,
        valueSuffix: '%',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadow: true
      },
      legend: {
        enabled: true,
        itemStyle: { fontSize: '12px', color: '#2C3E50' }
      }
    };

    if (selectedChartType === 'grid' || selectedChartType === 'heatmap') {
      return {
        ...baseOptions,
        xAxis: {
          categories: processedData.xCategories,
          labels: { style: { fontSize: '12px', color: '#2C3E50' } }
        },
        yAxis: {
          categories: processedData.yCategories,
          title: { text: yAxisTitle || '' },
          labels: { style: { fontSize: '12px', color: '#2C3E50' } }
        },
        colorAxis: {
          stops: [
            [0, '#F3F4F6'],
            [0.5, '#93C5FD'],
            [1, '#2563EB']
          ],
          min: 0,
          max: 100
        },
        series: processedData.series
      };
    }

    if (selectedChartType === 'treemap') {
      return {
        ...baseOptions,
        series: processedData.series,
        colorAxis: {
          minColor: '#F3F4F6',
          maxColor: '#2563EB'
        }
      };
    }

    return {
      ...baseOptions,
      xAxis: {
        categories: processedData.categories,
        title: { text: 'Period', style: { color: '#2C3E50' } },
        labels: { style: { fontSize: '12px', color: '#2C3E50' } },
        gridLineColor: '#E5E7EB'
      },
      yAxis: {
        title: {
          text: yAxisTitle || '',
          style: { fontSize: '14px', color: '#2C3E50' }
        },
        labels: { style: { fontSize: '12px', color: '#2C3E50' } },
        gridLineColor: '#E5E7EB'
      },
      plotOptions: {
        series: {
          animation: true,
          borderRadius: 3
        },
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
            style: { fontSize: '12px', color: '#2C3E50' }
          }
        },
        bar: {
          stacking: selectedChartType === 'stackbar' ? 'normal' : undefined,
          dataLabels: {
            enabled: true,
            format: '{point.y:.2f}%',
            style: { color: '#2C3E50' }
          }
        }
      },
      series: processedData.series
    };
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">{chartData.title}</h2>
        <div className="relative">
          <select
            value={selectedChartType}
            onChange={(e) => setSelectedChartType(e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm leading-5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {chartTypesList.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <ChevronDown size={16} />
          </div>
        </div>
      </div>
      <HighchartsReact highcharts={Highcharts} options={getChartOptions()} />
    </div>
  );
};

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {sampleData.map((chart, index) => (
          <DynamicChart key={index} chartData={chart} />
        ))}
      </div>
    </div>
  );
}

export default App;
