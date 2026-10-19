import { useState, useRef } from 'react';
import axios from 'axios';
import {
  Upload,
  FileSpreadsheet,
  X,
  CheckCircle,
  AlertCircle,
  Sparkles,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Brain
} from 'lucide-react';
import * as XLSX from 'xlsx';
import ReactMarkdown from 'react-markdown';

const API_BASE = 'http://localhost:4000';

/* ─────────────────────────── AI Summary Card ─────────────────────────── */
const AISummaryCard = ({ summary, loading, error, onRegenerate }) => {
  const [expanded, setExpanded] = useState(true);

  if (loading) {
    return (
      <div className="mt-6 rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-6 shadow-sm">
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
            <div
              key={i}
              className="h-3 rounded-full bg-purple-200 animate-pulse"
              style={{ width: `${w}%`, animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        <p className="text-xs text-purple-500 mt-4 text-center animate-pulse">
          Gemini is analyzing your spreadsheet…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-700">AI Summary Failed</p>
            <p className="text-xs text-red-600 mt-1">{error}</p>
          </div>
          <button
            onClick={onRegenerate}
            className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 font-medium"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="mt-6 rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-sm overflow-hidden">
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
          <button
            onClick={onRegenerate}
            title="Regenerate summary"
            className="p-1.5 rounded-lg text-purple-400 hover:text-purple-700 hover:bg-purple-100 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setExpanded(v => !v)}
            className="p-1.5 rounded-lg text-purple-400 hover:text-purple-700 hover:bg-purple-100 transition-colors"
          >
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

/* ─────────────────────────── Main Component ─────────────────────────── */
const ExcelUpload = ({ onUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // AI Summary state
  const [uploadedFileId, setUploadedFileId] = useState(null);
  const [aiSummary, setAiSummary] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const fileInputRef = useRef(null);

  const getToken = () => localStorage.getItem('token');

  /* ── Drag handlers ── */
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
  };

  const handleFileInput = (e) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  /* ── Fetch AI summary ── */
  const fetchAISummary = async (fileId) => {
    setAiLoading(true);
    setAiError('');
    setAiSummary(null);
    try {
      const res = await axios.post(
        `${API_BASE}/api/ai/summary/${fileId}`,
        {},
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      if (res.data.success) {
        setAiSummary(res.data.data.summary);
      } else {
        setAiError(res.data.message || 'Failed to generate summary.');
      }
    } catch (err) {
      setAiError(err.response?.data?.message || 'AI summary generation failed.');
    } finally {
      setAiLoading(false);
    }
  };

  /* ── Regenerate (clear cache then refetch) ── */
  const handleRegenerate = async () => {
    if (!uploadedFileId) return;
    try {
      await axios.delete(`${API_BASE}/api/ai/summary/${uploadedFileId}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
    } catch (_) { /* ignore clear errors */ }
    fetchAISummary(uploadedFileId);
  };

  /* ── Upload handler ── */
  const handleFileUpload = async () => {
    if (!file) { setError('Please select a file first.'); return; }

    setLoading(true);
    setError('');
    setSuccess('');
    setAiSummary(null);
    setAiError('');
    setUploadedFileId(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_BASE}/api/excel/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${getToken()}`
        }
      });

      if (response.data.success) {
        const uploadedData = response.data.data;
        setSuccess('File uploaded successfully!');
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';

        onUpload(uploadedData);

        // Trigger AI summary immediately after upload
        if (uploadedData?.id) {
          setUploadedFileId(uploadedData.id);
          fetchAISummary(uploadedData.id);
        }
      } else {
        setError(response.data.message || 'File upload failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during upload.');
    } finally {
      setLoading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError('');
    setSuccess('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-100 mb-4">
            <Upload className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">Upload Excel File</h3>
          <p className="text-sm text-slate-600 mb-6">
            Drag and drop your Excel file here, or click to browse
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 shrink-0" />
            {success}
          </div>
        )}

        {!file ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
              dragActive ? 'border-blue-400 bg-blue-50' : 'border-slate-300 hover:border-slate-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <FileSpreadsheet className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <p className="text-sm text-slate-600 mb-2">
              <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-slate-500">Excel files (.xlsx, .xls) or CSV files up to 5MB</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileInput}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 btn-primary"
            >
              Choose File
            </button>
          </div>
        ) : (
          <div className="border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileSpreadsheet className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-slate-900">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button onClick={removeFile} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {file && (
          <div className="mt-6 flex justify-end space-x-3">
            <button onClick={removeFile} className="btn-secondary">Cancel</button>
            <button
              onClick={handleFileUpload}
              disabled={loading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Uploading…
                </div>
              ) : (
                'Upload File'
              )}
            </button>
          </div>
        )}

        {/* AI Summary Section */}
        {(aiLoading || aiSummary || aiError) && (
          <AISummaryCard
            summary={aiSummary}
            loading={aiLoading}
            error={aiError}
            onRegenerate={handleRegenerate}
          />
        )}
      </div>
    </div>
  );
};

export default ExcelUpload;