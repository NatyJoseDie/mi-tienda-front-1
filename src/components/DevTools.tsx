'use client';

import React, { useState, useEffect } from 'react';
import { WrenchScrewdriverIcon, EyeIcon, EyeSlashIcon, TrashIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';

interface DevToolsProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  defaultOpen?: boolean;
}

const DevTools: React.FC<DevToolsProps> = ({ 
  position = 'bottom-right', 
  defaultOpen = false 
}) => {
  // Si no está en modo desarrollo, no renderizar nada
  if (process.env.NEXT_PUBLIC_DEV_MODE !== 'true') {
    return null;
  }

  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [activeTab, setActiveTab] = useState<'env' | 'storage' | 'api' | 'logs'>('env');
  const [logs, setLogs] = useState<Array<{ timestamp: string; level: string; message: string; data?: any }>>([]);
  const [apiCalls, setApiCalls] = useState<Array<{ timestamp: string; method: string; url: string; status?: number; response?: any }>>([]);

  // Interceptar console.log para capturar logs
  useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args) => {
      setLogs(prev => [...prev.slice(-49), {
        timestamp: new Date().toLocaleTimeString(),
        level: 'log',
        message: args.join(' '),
        data: args.length === 1 && typeof args[0] === 'object' ? args[0] : undefined
      }]);
      originalLog(...args);
    };

    console.error = (...args) => {
      setLogs(prev => [...prev.slice(-49), {
        timestamp: new Date().toLocaleTimeString(),
        level: 'error',
        message: args.join(' '),
        data: args.length === 1 && typeof args[0] === 'object' ? args[0] : undefined
      }]);
      originalError(...args);
    };

    console.warn = (...args) => {
      setLogs(prev => [...prev.slice(-49), {
        timestamp: new Date().toLocaleTimeString(),
        level: 'warn',
        message: args.join(' '),
        data: args.length === 1 && typeof args[0] === 'object' ? args[0] : undefined
      }]);
      originalWarn(...args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  // Interceptar fetch para capturar llamadas API
  useEffect(() => {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const [url, options] = args;
      const method = options?.method || 'GET';
      const timestamp = new Date().toLocaleTimeString();
      
      try {
        const response = await originalFetch(...args);
        const clonedResponse = response.clone();
        
        try {
          const responseData = await clonedResponse.json();
          setApiCalls(prev => [...prev.slice(-19), {
            timestamp,
            method,
            url: url.toString(),
            status: response.status,
            response: responseData
          }]);
        } catch {
          setApiCalls(prev => [...prev.slice(-19), {
            timestamp,
            method,
            url: url.toString(),
            status: response.status
          }]);
        }
        
        return response;
      } catch (error) {
        setApiCalls(prev => [...prev.slice(-19), {
          timestamp,
          method,
          url: url.toString(),
          status: 0
        }]);
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left': return 'bottom-4 left-4';
      case 'top-right': return 'top-4 right-4';
      case 'top-left': return 'top-4 left-4';
      default: return 'bottom-4 right-4';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const clearApiCalls = () => {
    setApiCalls([]);
  };

  const clearStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
  };

  const getEnvVars = () => {
    return Object.entries(process.env)
      .filter(([key]) => key.startsWith('NEXT_PUBLIC_'))
      .sort(([a], [b]) => a.localeCompare(b));
  };

  const getStorageData = () => {
    const localStorage_data: Record<string, string> = {};
    const sessionStorage_data: Record<string, string> = {};

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) localStorage_data[key] = localStorage.getItem(key) || '';
    }

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) sessionStorage_data[key] = sessionStorage.getItem(key) || '';
    }

    return { localStorage: localStorage_data, sessionStorage: sessionStorage_data };
  };

  if (!isOpen) {
    return (
      <div className={`fixed ${getPositionClasses()} z-50`}>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors"
          title="Abrir DevTools"
        >
          <WrenchScrewdriverIcon className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed ${getPositionClasses()} z-50 w-96 max-h-96 bg-gray-900 text-white rounded-lg shadow-2xl border border-gray-700`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <WrenchScrewdriverIcon className="w-5 h-5 text-blue-400" />
          <span className="font-semibold text-sm">DevTools</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <EyeSlashIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        {[
          { id: 'env', label: 'ENV' },
          { id: 'storage', label: 'Storage' },
          { id: 'api', label: 'API' },
          { id: 'logs', label: 'Logs' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-2 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-3 max-h-64 overflow-y-auto text-xs">
        {activeTab === 'env' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-green-400">Variables de Entorno</span>
            </div>
            {getEnvVars().map(([key, value]) => (
              <div key={key} className="bg-gray-800 p-2 rounded">
                <div className="flex items-center justify-between">
                  <span className="text-blue-300 font-mono">{key}</span>
                  <button
                    onClick={() => copyToClipboard(`${key}=${value}`)}
                    className="text-gray-400 hover:text-white"
                  >
                    <DocumentDuplicateIcon className="w-3 h-3" />
                  </button>
                </div>
                <div className="text-gray-300 font-mono break-all">{value}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'storage' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-yellow-400">Storage</span>
              <button
                onClick={clearStorage}
                className="text-red-400 hover:text-red-300"
                title="Limpiar todo el storage"
              >
                <TrashIcon className="w-3 h-3" />
              </button>
            </div>
            
            {Object.entries(getStorageData()).map(([storageType, data]) => (
              <div key={storageType}>
                <h4 className="font-semibold text-purple-400 mb-1">{storageType}</h4>
                {Object.entries(data).length === 0 ? (
                  <p className="text-gray-500 italic">Vacío</p>
                ) : (
                  Object.entries(data).map(([key, value]) => (
                    <div key={key} className="bg-gray-800 p-2 rounded mb-1">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-300 font-mono">{key}</span>
                        <button
                          onClick={() => copyToClipboard(value)}
                          className="text-gray-400 hover:text-white"
                        >
                          <DocumentDuplicateIcon className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-gray-300 font-mono break-all">{value}</div>
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'api' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-orange-400">Llamadas API</span>
              <button
                onClick={clearApiCalls}
                className="text-red-400 hover:text-red-300"
                title="Limpiar llamadas API"
              >
                <TrashIcon className="w-3 h-3" />
              </button>
            </div>
            {apiCalls.length === 0 ? (
              <p className="text-gray-500 italic">No hay llamadas API</p>
            ) : (
              apiCalls.slice().reverse().map((call, index) => (
                <div key={index} className="bg-gray-800 p-2 rounded">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-mono text-xs px-1 rounded ${
                      call.method === 'GET' ? 'bg-green-600' :
                      call.method === 'POST' ? 'bg-blue-600' :
                      call.method === 'PUT' ? 'bg-yellow-600' :
                      call.method === 'DELETE' ? 'bg-red-600' : 'bg-gray-600'
                    }`}>
                      {call.method}
                    </span>
                    <span className={`text-xs ${
                      call.status && call.status >= 200 && call.status < 300 ? 'text-green-400' :
                      call.status && call.status >= 400 ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {call.status || 'Error'}
                    </span>
                  </div>
                  <div className="text-gray-300 font-mono break-all text-xs">{call.url}</div>
                  <div className="text-gray-500 text-xs">{call.timestamp}</div>
                  {call.response && (
                    <details className="mt-1">
                      <summary className="text-blue-300 cursor-pointer text-xs">Response</summary>
                      <pre className="text-xs text-gray-300 mt-1 bg-gray-900 p-1 rounded overflow-x-auto">
                        {JSON.stringify(call.response, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-cyan-400">Console Logs</span>
              <button
                onClick={clearLogs}
                className="text-red-400 hover:text-red-300"
                title="Limpiar logs"
              >
                <TrashIcon className="w-3 h-3" />
              </button>
            </div>
            {logs.length === 0 ? (
              <p className="text-gray-500 italic">No hay logs</p>
            ) : (
              logs.slice().reverse().map((log, index) => (
                <div key={index} className="bg-gray-800 p-2 rounded">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs px-1 rounded font-mono ${
                      log.level === 'error' ? 'bg-red-600' :
                      log.level === 'warn' ? 'bg-yellow-600' : 'bg-blue-600'
                    }`}>
                      {log.level.toUpperCase()}
                    </span>
                    <span className="text-gray-500 text-xs">{log.timestamp}</span>
                  </div>
                  <div className="text-gray-300 font-mono text-xs break-all">{log.message}</div>
                  {log.data && (
                    <details className="mt-1">
                      <summary className="text-blue-300 cursor-pointer text-xs">Data</summary>
                      <pre className="text-xs text-gray-300 mt-1 bg-gray-900 p-1 rounded overflow-x-auto">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DevTools;