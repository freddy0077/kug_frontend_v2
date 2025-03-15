'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

// Define TypeScript interfaces for our data
interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  source: string;
  details?: Record<string, any>;
  userId?: string;
}

// Mock data for demonstration
const mockLogs: LogEntry[] = [
  {
    id: '1',
    timestamp: new Date(2025, 2, 9, 14, 32, 12), // Always ensure dates are properly instantiated
    level: 'info',
    message: 'User logged in',
    source: 'auth',
    userId: 'user123'
  },
  {
    id: '2',
    timestamp: new Date(2025, 2, 9, 14, 35, 22),
    level: 'warn',
    message: 'Failed login attempt',
    source: 'auth',
    details: { attempts: 3, ip: '192.168.1.1' },
    userId: 'user456'
  },
  {
    id: '3',
    timestamp: new Date(2025, 2, 9, 15, 12, 45),
    level: 'error',
    message: 'Database connection failed',
    source: 'database',
    details: { error: 'Connection timeout' }
  },
  {
    id: '4',
    timestamp: new Date(2025, 2, 9, 15, 30, 10),
    level: 'info',
    message: 'Dog record updated',
    source: 'pedigree',
    details: { dogId: 'dog123', fields: ['name', 'breed'] },
    userId: 'user123'
  },
  {
    id: '5',
    timestamp: new Date(2025, 2, 9, 16, 5, 33),
    level: 'debug',
    message: 'Cache refreshed',
    source: 'system',
    details: { items: 256 }
  },
  {
    id: '6',
    timestamp: new Date(2025, 2, 10, 9, 2, 15),
    level: 'info',
    message: 'Pedigree chart generated',
    source: 'pedigree',
    details: { dogId: 'dog456', generations: 4 },
    userId: 'user789'
  },
  {
    id: '7',
    timestamp: new Date(2025, 2, 10, 9, 45, 22),
    level: 'error',
    message: 'Failed to update dog health record',
    source: 'health',
    details: { dogId: 'dog789', error: 'Validation failed' },
    userId: 'user123'
  }
];

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    level: 'all',
    source: 'all',
    search: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        // In a real application, this would be an API call
        // For now, we'll use the mock data and simulate a delay
        setTimeout(() => {
          setLogs(mockLogs);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching logs:', error);
        toast.error('Failed to load logs');
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // Apply filters to logs
  const filteredLogs = logs.filter(log => {
    // Filter by level
    if (filter.level !== 'all' && log.level !== filter.level) {
      return false;
    }
    
    // Filter by source
    if (filter.source !== 'all' && log.source !== filter.source) {
      return false;
    }
    
    // Filter by search text (in message or details)
    if (filter.search && !log.message.toLowerCase().includes(filter.search.toLowerCase())) {
      return false;
    }
    
    // Filter by date range
    if (filter.startDate) {
      const startDate = new Date(filter.startDate);
      if (log.timestamp < startDate) {
        return false;
      }
    }
    
    if (filter.endDate) {
      const endDate = new Date(filter.endDate);
      // Set time to end of day
      endDate.setHours(23, 59, 59, 999);
      if (log.timestamp > endDate) {
        return false;
      }
    }
    
    return true;
  });
  
  // Get unique sources for filter dropdown
  const sources = ['all', ...new Set(logs.map(log => log.source))];
  
  // Helper function to format log timestamp
  const formatTimestamp = (date: Date) => {
    try {
      return format(date, 'yyyy-MM-dd HH:mm:ss');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };
  
  // Helper function to get badge color based on log level
  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'warn':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'debug':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const handleExportLogs = () => {
    try {
      // Convert logs to CSV format
      const headers = ['ID', 'Timestamp', 'Level', 'Source', 'Message', 'Details', 'User ID'];
      const csvContent = [
        headers.join(','),
        ...filteredLogs.map(log => [
          log.id,
          formatTimestamp(log.timestamp),
          log.level,
          log.source,
          `"${log.message.replace(/"/g, '""')}"`,
          log.details ? `"${JSON.stringify(log.details).replace(/"/g, '""')}"` : '',
          log.userId || ''
        ].join(','))
      ].join('\n');
      
      // Create a blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `system-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Logs exported successfully');
    } catch (error) {
      console.error('Error exporting logs:', error);
      toast.error('Failed to export logs');
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">System Logs</h1>
        <button 
          onClick={handleExportLogs} 
          className="ml-4 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
        >
          Export Logs
        </button>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
          <select 
            defaultValue="all"
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilter({...filter, level: e.target.value})}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All Levels</option>
            <option value="info">Info</option>
            <option value="warn">Warning</option>
            <option value="error">Error</option>
            <option value="debug">Debug</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
          <select 
            defaultValue="all"
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilter({...filter, source: e.target.value})}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          >
            {sources.map((source) => (
              <option key={source} value={source}>
                {source === 'all' ? 'All Sources' : source.charAt(0).toUpperCase() + source.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input 
            type="date" 
            value={filter.startDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilter({...filter, startDate: e.target.value})}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input 
            type="date" 
            value={filter.endDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilter({...filter, endDate: e.target.value})}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search logs..."
              value={filter.search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilter({...filter, search: e.target.value})}
              className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 focus:border-blue-500 focus:outline-none"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No logs found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelBadgeColor(log.level)}`}>
                        {log.level.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.source}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {log.message}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.userId || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {log.details ? (
                        <details className="cursor-pointer">
                          <summary className="text-blue-600 hover:text-blue-800">View Details</summary>
                          <pre className="mt-2 text-xs bg-gray-50 p-2 rounded-md overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
