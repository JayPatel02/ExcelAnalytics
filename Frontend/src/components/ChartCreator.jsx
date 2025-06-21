import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Pie, Scatter as ScatterChart, Doughnut, Radar } from 'react-chartjs-2';
import { BarChart3, TrendingUp, PieChart, ScatterChart as ScatterIcon, AreaChart as AreaIcon, Circle, Radar as RadarIcon, Settings, Download } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const chartTypes = [
  { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
  { value: 'line', label: 'Line Chart', icon: TrendingUp },
  { value: 'pie', label: 'Pie Chart', icon: PieChart },
  { value: 'scatter', label: 'Scatter Plot', icon: ScatterIcon },
  { value: 'area', label: 'Area Chart', icon: AreaIcon },
  { value: 'doughnut', label: 'Doughnut Chart', icon: Circle },
  { value: 'radar', label: 'Radar Chart', icon: RadarIcon },
];

const ChartCreator = () => {
  const [excelData, setExcelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chartType, setChartType] = useState('bar');
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [availableColumns, setAvailableColumns] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [chartOptions, setChartOptions] = useState({});

  const chartRef = useRef();

  useEffect(() => {
    loadExcelData();
  }, []);

  useEffect(() => {
    if (excelData && xAxis && yAxis) {
      generateChartData();
    }
  }, [excelData, chartType, xAxis, yAxis]);

  const loadExcelData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:4000/api/excel/data-for-charts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        const data = response.data.data.excelData;
        setExcelData(data);
        
        // Extract column headers
        if (data.data && data.data.length > 0) {
          const headers = data.data[0] || [];
          setAvailableColumns(headers);
          
          // Set default axes
          if (headers.length >= 2) {
            setXAxis(headers[0] || '');
            setYAxis(headers[1] || '');
          }
        }
      }
    } catch (err) {
      setError('Failed to load Excel data');
      console.error('Error loading Excel data:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = () => {
    if (!excelData || !xAxis || !yAxis) return;

    const data = excelData.data;
    const xIndex = availableColumns.indexOf(xAxis);
    const yIndex = availableColumns.indexOf(yAxis);

    if (xIndex === -1 || yIndex === -1) return;

    // Extract data for chart
    const labels = [];
    const values = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[xIndex] !== undefined && row[yIndex] !== undefined) {
        labels.push(String(row[xIndex]));
        values.push(Number(row[yIndex]) || 0);
      }
    }

    // Generate colors
    const colors = generateColors(labels.length);

    const chartConfig = {
      labels,
      datasets: [
        {
          label: yAxis,
          data: values,
          backgroundColor: colors.map(color => color + '80'),
          borderColor: colors,
          borderWidth: 2,
          fill: chartType === 'area',
        },
      ],
    };

    setChartData(chartConfig);
  };

  const generateColors = (count) => {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
    ];
    
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(colors[i % colors.length]);
    }
    return result;
  };

  const generateChart = () => {
    if (!excelData || !xAxis || !yAxis) return;

    const xIndex = excelData.headers.indexOf(xAxis);
    const yIndex = excelData.headers.indexOf(yAxis);

    if (xIndex === -1 || yIndex === -1) return;

    const labels = excelData.rows.map(row => row[xIndex]).filter(label => label !== undefined && label !== null);
    const data = excelData.rows.map(row => {
      const value = row[yIndex];
      return typeof value === 'number' ? value : parseFloat(value) || 0;
    });

    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
    ];

    const baseData = {
      labels,
      datasets: [
        {
          label: yAxis,
          data,
          backgroundColor: chartType === 'bar' ? colors.slice(0, data.length) : colors[0],
          borderColor: colors[0],
          borderWidth: 2,
          fill: chartType === 'line' ? false : undefined,
          tension: chartType === 'line' ? 0.4 : undefined
        }
      ]
    };

    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart: ${xAxis} vs ${yAxis}`,
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
        }
      },
      scales: chartType !== 'pie' && chartType !== 'doughnut' ? {
        x: {
          display: true,
          title: {
            display: true,
            text: xAxis
          }
        },
        y: {
          display: true,
          title: {
            display: true,
            text: yAxis
          }
        }
      } : undefined
    };

    setChartData(baseData);
    setChartOptions(baseOptions);
  };

  const downloadChart = () => {
    if (chartRef.current) {
      const canvas = chartRef.current.canvas;
      const link = document.createElement('a');
      link.download = `chart-${chartType}-${xAxis}-${yAxis}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const renderChart = () => {
    if (!chartData) return null;

    const chartProps = {
      ref: chartRef,
      data: chartData,
      options: chartOptions
    };

    switch (chartType) {
      case 'bar':
        return <Bar {...chartProps} />;
      case 'line':
        return <Line {...chartProps} />;
      case 'pie':
        return <Pie {...chartProps} />;
      case 'scatter':
        return <ScatterChart {...chartProps} />;
      case 'area':
        return <Line {...chartProps} />;
      case 'doughnut':
        return <Doughnut {...chartProps} />;
      case 'radar':
        return <Radar {...chartProps} />;
      default:
        return <Bar {...chartProps} />;
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-slate-600">Loading Excel data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!excelData) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="mx-auto h-12 w-12 text-slate-400 mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">No Data Available</h3>
        <p className="text-slate-600">Please upload an Excel file first to create charts.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Chart Type Selection */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-slate-900">Chart Configuration</h3>
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-slate-400" />
            <span className="text-sm text-slate-600">Chart Settings</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Chart Type */}
          <div>
            <label className="form-label">Chart Type</label>
            <div className="grid grid-cols-2 gap-2">
              {chartTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setChartType(type.value)}
                  className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-colors duration-200 ${
                    chartType === type.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <type.icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Axis Selection */}
          <div className="space-y-4">
            <div>
              <label className="form-label">X-Axis (Categories)</label>
              <select
                value={xAxis}
                onChange={(e) => setXAxis(e.target.value)}
                className="input-field"
              >
                <option value="">Select X-Axis</option>
                {availableColumns.map((column, index) => (
                  <option key={index} value={column}>
                    {column}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Y-Axis (Values)</label>
              <select
                value={yAxis}
                onChange={(e) => setYAxis(e.target.value)}
                className="input-field"
              >
                <option value="">Select Y-Axis</option>
                {availableColumns.map((column, index) => (
                  <option key={index} value={column}>
                    {column}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Display */}
      {chartData && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-slate-900">Chart Preview</h3>
            <button
              onClick={downloadChart}
              className="flex items-center space-x-2 btn-secondary"
            >
              <Download className="h-4 w-4" />
              <span>Download</span>
            </button>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <div className="h-96">
              {renderChart()}
            </div>
          </div>
        </div>
      )}

      {/* Data Preview */}
      <div className="card">
        <h3 className="text-lg font-medium text-slate-900 mb-4">Data Preview</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {excelData.headers.map((header, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {excelData.rows.slice(0, 10).map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="px-6 py-4 whitespace-nowrap text-sm text-slate-900"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {excelData.rows.length > 10 && (
          <p className="text-sm text-slate-500 mt-2">
            Showing first 10 rows of {excelData.rows.length} total rows
          </p>
        )}
      </div>
    </div>
  );
};

export default ChartCreator; 