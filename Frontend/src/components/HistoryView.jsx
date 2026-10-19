import { useState } from 'react';
import axios from 'axios';
import { History, FileText, Calendar, Download, Trash2, RefreshCw } from 'lucide-react';

const HistoryView = ({ history, onRefresh }) => {
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    await onRefresh();
    setLoading(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:4000/api/excel/file/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onRefresh();
    } catch (err) {
      alert('Failed to delete file.');
      console.error('Delete error:', err);
    }
  };

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-12">
        <History className="mx-auto h-12 w-12 text-slate-400 mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">No Upload History</h3>
        <p className="text-slate-600">You haven't uploaded any files yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <History className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-medium text-slate-900">Upload History</h3>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center space-x-2 btn-secondary disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="space-y-4">
          {history.map((item, index) => (
            <div
              key={item._id || index}
              className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-900">{item.fileName}</h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-1 text-xs text-slate-500">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(item.uploadTime)}</span>
                      </div>
                      {item.fileSize && (
                        <span className="text-xs text-slate-500">
                          {formatFileSize(item.fileSize)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="flex items-center space-x-1 text-slate-600 hover:text-red-600 transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="text-sm">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-600">
            Total files: {history.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HistoryView; 