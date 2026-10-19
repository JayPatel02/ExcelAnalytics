import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
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
import {
  BarChart3, TrendingUp, PieChart, ScatterChart as ScatterIcon,
  AreaChart as AreaIcon, Circle, Radar as RadarIcon, Settings, Download,
  Sparkles, RefreshCw, ChevronDown, ChevronUp, Brain, AlertCircle
} from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  ArcElement, RadialLinearScale, Title, Tooltip, Legend, Filler
);

const API_BASE = 'http://localhost:4000';
const getToken = () => localStorage.getItem('token');

const chartTypes = [
  { value: 'bar',      label: 'Bar Chart',      icon: BarChart3 },
  { value: 'line',     label: 'Line Chart',      icon: TrendingUp },
  { value: 'pie',      label: 'Pie Chart',       icon: PieChart },
  { value: 'scatter',  label: 'Scatter Plot',    icon: ScatterIcon },
  { value: 'area',     label: 'Area Chart',      icon: AreaIcon },
  { value: 'doughnut', label: 'Doughnut Chart',  icon: Circle },
  { value: 'radar',    label: 'Radar Chart',     icon: RadarIcon },
];

/* ─────────────────────── AI Summary Panel ─────────────────────── */
const AISummaryPanel = ({ fileId }) => {
  const [summary, setSummary]     = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [expanded, setExpanded]   = useState(true);
  const [fetched, setFetched]     = useState(false);

  const fetchSummary = async (forceRegen = false) => {
    setLoading(true);
    setError('');
    try {
      if (forceRegen) {
        await axios.delete(`${API_BASE}/api/ai/summary/${fileId}`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
      }
      const res = await axios.post(
        `${API_BASE}/api/ai/summary/${fileId}`,
        {},
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      if (res.data.success) {
        setSummary(res.data.data.summary);
      } else {
        setError(res.data.message || 'Failed to generate summary.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'AI summary generation failed.');
    } finally {
      setLoading(false);
      setFetched(true);
    }
  };

  // Auto-fetch on mount
  useEffect(() => {
    if (fileId && !fetched) fetchSummary();
  }, [fileId]);

  if (!fileId) return null;

  /* Loading skeleton */
  if (loading) return (
    <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-9 w-9 rounded-xl bg-purple-600 flex items-center justify-center shadow">
          <Brain className="h-5 w-5 text-white animate-pulse" />
        </div>
        <div>
          <h4 className="font-semibold text-purple-900 text-sm">AI Analysis</h4>
          <p className="text-xs text-purple-600">Powered by Google Gemini</p>
        </div>
      </div>
      <div className="space-y-3">
        {[100, 85, 92, 70].map((w, i) => (
          <div key={i} className="h-3 rounded-full bg-purple-200 animate-pulse"
            style={{ width: `${w}%`, animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
      <p className="text-xs text-purple-500 mt-4 text-center animate-pulse">
        Gemini is analysing your spreadsheet…
      </p>
    </div>
  );

  /* Error state */
  if (error) return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-red-700">AI Summary Failed</p>
          <p className="text-xs text-red-600 mt-1">{error}</p>
        </div>
        <button onClick={() => fetchSummary(true)}
          className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 font-medium">
          <RefreshCw className="h-3.5 w-3.5" /> Retry
        </button>
      </div>
    </div>
  );

  if (!summary) return null;

  return (
    <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-purple-100">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-md">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-purple-900 text-sm">AI Summary</h4>
            <p className="text-xs text-purple-500">Powered by Google Gemini</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => fetchSummary(true)} title="Regenerate"
            className="p-1.5 rounded-lg text-purple-400 hover:text-purple-700 hover:bg-purple-100 transition-colors">
            <RefreshCw className="h-4 w-4" />
          </button>
          <button onClick={() => setExpanded(v => !v)}
            className="p-1.5 rounded-lg text-purple-400 hover:text-purple-700 hover:bg-purple-100 transition-colors">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {/* Content */}
      {expanded && (
        <div className="px-5 py-4 ai-markdown">
          <ReactMarkdown>{summary}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────── Main Component ─────────────────────── */
const ChartCreator = () => {
  const [excelData, setExcelData]           = useState(null);
  const [fileId, setFileId]                 = useState(null);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState('');
  const [chartType, setChartType]           = useState('bar');
  const [xAxis, setXAxis]                   = useState('');
  const [yAxis, setYAxis]                   = useState('');
  const [availableColumns, setAvailableColumns] = useState([]);
  const [chartData, setChartData]           = useState(null);
  const [chartOptions, setChartOptions]     = useState({});

  const chartRef = useRef();

  useEffect(() => { loadExcelData(); }, []);

  useEffect(() => {
    if (excelData && xAxis && yAxis) generateChart();
  }, [excelData, chartType, xAxis, yAxis]);

  const loadExcelData = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE}/api/excel/data-for-charts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        const { id, excelData: data } = response.data.data;
        setFileId(id);
        setExcelData(data);

        if (data.data && data.data.length > 0) {
          const headers = data.data[0] || [];
          setAvailableColumns(headers);
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

  const generateColors = (count) => {
    const palette = [
      '#3B82F6','#EF4444','#10B981','#F59E0B','#8B5CF6',
      '#06B6D4','#84CC16','#F97316','#EC4899','#6366F1'
    ];
    return Array.from({ length: count }, (_, i) => palette[i % palette.length]);
  };

  const generateChart = () => {
    if (!excelData || !xAxis || !yAxis) return;

    const xIndex = excelData.headers.indexOf(xAxis);
    const yIndex = excelData.headers.indexOf(yAxis);
    if (xIndex === -1 || yIndex === -1) return;

    const labels = excelData.rows.map(row => row[xIndex]).filter(l => l !== undefined && l !== null);
    const data   = excelData.rows.map(row => {
      const v = row[yIndex];
      return typeof v === 'number' ? v : parseFloat(v) || 0;
    });

    const colors = generateColors(data.length);

    setChartData({
      labels,
      datasets: [{
        label: yAxis,
        data,
        backgroundColor: chartType === 'bar' ? colors.slice(0, data.length) : colors[0],
        borderColor: colors[0],
        borderWidth: 2,
        fill: chartType === 'line' ? false : undefined,
        tension: chartType === 'line' ? 0.4 : undefined
      }]
    });

    setChartOptions({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        title: {
          display: true,
          text: `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart: ${xAxis} vs ${yAxis}`,
          font: { size: 16, weight: 'bold' }
        },
        tooltip: { mode: 'index', intersect: false }
      },
      scales: chartType !== 'pie' && chartType !== 'doughnut' ? {
        x: { display: true, title: { display: true, text: xAxis } },
        y: { display: true, title: { display: true, text: yAxis } }
      } : undefined
    });
  };

  const downloadChart = () => {
    if (chartRef.current) {
      const link = document.createElement('a');
      link.download = `chart-${chartType}-${xAxis}-${yAxis}.png`;
      link.href = chartRef.current.canvas.toDataURL();
      link.click();
    }
  };

  const renderChart = () => {
    if (!chartData) return null;
    const props = { ref: chartRef, data: chartData, options: chartOptions };
    switch (chartType) {
      case 'bar':      return <Bar      {...props} />;
      case 'line':     return <Line     {...props} />;
      case 'pie':      return <Pie      {...props} />;
      case 'scatter':  return <ScatterChart {...props} />;
      case 'area':     return <Line     {...props} />;
      case 'doughnut': return <Doughnut {...props} />;
      case 'radar':    return <Radar    {...props} />;
      default:         return <Bar      {...props} />;
    }
  };

  if (loading) return (
    <div className="card">
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-2 text-slate-600">Loading Excel data...</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="card">
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
      </div>
    </div>
  );

  if (!excelData) return (
    <div className="text-center py-12">
      <BarChart3 className="mx-auto h-12 w-12 text-slate-400 mb-4" />
      <h3 className="text-lg font-medium text-slate-900 mb-2">No Data Available</h3>
      <p className="text-slate-600">Please upload an Excel file first to create charts.</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ── AI Summary Panel ── */}
      <AISummaryPanel fileId={fileId} />

      {/* ── Chart Configuration ── */}
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
                <button key={type.value} onClick={() => setChartType(type.value)}
                  className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-colors duration-200 ${
                    chartType === type.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}>
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
              <select value={xAxis} onChange={(e) => setXAxis(e.target.value)} className="input-field">
                <option value="">Select X-Axis</option>
                {availableColumns.map((col, i) => <option key={i} value={col}>{col}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Y-Axis (Values)</label>
              <select value={yAxis} onChange={(e) => setYAxis(e.target.value)} className="input-field">
                <option value="">Select Y-Axis</option>
                {availableColumns.map((col, i) => <option key={i} value={col}>{col}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Chart Preview ── */}
      {chartData && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-slate-900">Chart Preview</h3>
            <button onClick={downloadChart} className="flex items-center space-x-2 btn-secondary">
              <Download className="h-4 w-4" />
              <span>Download</span>
            </button>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="h-96">{renderChart()}</div>
          </div>
        </div>
      )}

      {/* ── Data Preview ── */}
      <div className="card">
        <h3 className="text-lg font-medium text-slate-900 mb-4">Data Preview</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {excelData.headers.map((header, i) => (
                  <th key={i} className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {excelData.rows.slice(0, 10).map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{cell}</td>
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