import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Upload, 
  BarChart3, 
  History, 
  LogOut, 
  User, 
  FileText,
  Calendar,
  TrendingUp
} from 'lucide-react';
import ExcelUpload from './ExcelUpload';
import ChartCreator from './ChartCreator';
import HistoryView from './HistoryView';

const Dashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [excelData, setExcelData] = useState(null);
  const [uploadHistory, setUploadHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const fetchUploadHistory = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:4000/api/excel/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setUploadHistory(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUploadHistory();
  }, [fetchUploadHistory]);

  const handleLogout = async () => {
    try {
        const token = localStorage.getItem('token');
        await axios.post('http://localhost:4000/api/users/logout', {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        onLogout();
    }
  };

  const handleFileUpload = (data) => {
    setExcelData(data);
    setActiveTab('chart');
    fetchUploadHistory();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'upload':
        return <ExcelUpload onUpload={handleFileUpload} />;
      case 'chart':
        return excelData ? <ChartCreator excelData={excelData} /> : <ExcelUpload onUpload={handleFileUpload} />;
      case 'history':
        return <HistoryView history={uploadHistory} onRefresh={fetchUploadHistory} />;
      default:
        return <ExcelUpload onUpload={handleFileUpload} />;
    }
  };

  const getTabIcon = (tab) => {
    switch (tab) {
      case 'upload':
        return <Upload className="h-5 w-5" />;
      case 'chart':
        return <BarChart3 className="h-5 w-5" />;
      case 'history':
        return <History className="h-5 w-5" />;
      default:
        return <Upload className="h-5 w-5" />;
    }
  };

  const tabs = [
    { id: 'upload', label: 'Upload Excel', icon: getTabIcon('upload') },
    { id: 'chart', label: 'Create Charts', icon: getTabIcon('chart') },
    { id: 'history', label: 'History', icon: getTabIcon('history') }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-semibold text-slate-900">Excel Analytics</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-slate-600">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">{user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            renderTabContent()
          )}
        </div>
      </main>

      {/* Quick Stats */}
      {uploadHistory.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Total Files</p>
                  <p className="text-2xl font-semibold text-slate-900">{uploadHistory.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Latest Upload</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {uploadHistory[0] ? new Date(uploadHistory[0].uploadTime).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Charts Created</p>
                  <p className="text-2xl font-semibold text-slate-900">0</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 