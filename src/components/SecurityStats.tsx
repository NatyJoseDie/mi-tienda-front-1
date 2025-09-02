'use client';

import React, { useState, useEffect } from 'react';
interface SecurityStats {
  totalAttempts: number;
  failedAttempts: number;
  blockedIPs: number;
  suspiciousActivity: number;
  lastHourAttempts: number;
  successRate: number;
  intentosFallidos24h: number;
  ipsBloquedas: number;
  intentosPorHora: Array<{
    intentos: number;
  }>;
  topFailedIPs: Array<{
    ip: string;
    attempts: number;
    lastAttempt: string;
  }>;
  topIpsSospechosas: Array<{
    ip: string;
    intentos: number;
    ultimoIntento: string;
  }>;
  recentActivity: Array<{
    timestamp: string;
    ip: string;
    userAgent: string;
    success: boolean;
    reason?: string;
  }>;
}
import {
  Shield,
  AlertTriangle,
  Ban,
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  RefreshCw,
  Download,
  Filter,
  Calendar,
} from 'lucide-react';

// Usando la interfaz SecurityStats del servicio auth

interface SecurityStatsProps {
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // en segundos
}

const SecurityStats: React.FC<SecurityStatsProps> = ({
  className = '',
  autoRefresh = true,
  refreshInterval = 30,
}) => {
  const [data, setData] = useState<SecurityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  const fetchStats = async () => {
    try {
      setError('');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/auth/security-stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener estadísticas');
      }

      const stats = await response.json();
      setData(stats);
      setLastRefresh(new Date());
    } catch (err: any) {
      console.error('Error fetching security stats:', err);
      setError(err.message || 'Error al cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [selectedTimeRange]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchStats();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatPercentage = (num: number): string => {
    const sign = num > 0 ? '+' : '';
    return `${sign}${num.toFixed(1)}%`;
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <TrendingUp className="w-4 h-4 text-red-500" />;
    } else if (trend < 0) {
      return <TrendingDown className="w-4 h-4 text-green-500" />;
    }
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  const getTrendColor = (trend: number, isGoodWhenUp: boolean = false) => {
    if (trend === 0) return 'text-gray-500';
    
    if (isGoodWhenUp) {
      return trend > 0 ? 'text-green-600' : 'text-red-600';
    } else {
      return trend > 0 ? 'text-red-600' : 'text-green-600';
    }
  };

  const getActivityTypeConfig = (type: string) => {
    switch (type) {
      case 'success':
        return { color: 'bg-green-100 text-green-800', label: 'Éxito' };
      case 'failed':
        return { color: 'bg-red-100 text-red-800', label: 'Fallido' };
      case 'blocked':
        return { color: 'bg-orange-100 text-orange-800', label: 'Bloqueado' };
      case 'suspicious':
        return { color: 'bg-purple-100 text-purple-800', label: 'Sospechoso' };
      default:
        return { color: 'bg-gray-100 text-gray-800', label: 'Desconocido' };
    }
  };

  const exportData = () => {
    if (!data) return;
    
    const exportData = {
      timestamp: new Date().toISOString(),
      timeRange: selectedTimeRange,
      stats: data,
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-stats-${selectedTimeRange}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar estadísticas</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchStats}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const successRate = data.intentosFallidos24h > 0 ? ((data.intentosPorHora.reduce((acc, curr) => acc + curr.intentos, 0) - data.intentosFallidos24h) / data.intentosPorHora.reduce((acc, curr) => acc + curr.intentos, 0)) * 100 : 0;

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Estadísticas de Seguridad</h2>
              <p className="text-sm text-gray-500">
                Última actualización: {lastRefresh.toLocaleTimeString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Time range selector */}
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="1h">Última hora</option>
              <option value="24h">Últimas 24h</option>
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
            </select>
            
            <button
              onClick={fetchStats}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title="Actualizar"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            
            <button
              onClick={exportData}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title="Exportar datos"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Attempts */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex items-center gap-1">
                <Activity className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-500">
                  --
                </span>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(data.intentosPorHora.reduce((acc, curr) => acc + curr.intentos, 0))}
            </div>
            <div className="text-sm text-gray-600">Total de intentos</div>
          </div>

          {/* Success Rate */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex items-center gap-1">
                <Activity className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-500">
                  --
                </span>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {successRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Tasa de éxito</div>
          </div>

          {/* Blocked IPs */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <Ban className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex items-center gap-1">
                <Activity className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-500">
                  --
                </span>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(data.ipsBloquedas)}
            </div>
            <div className="text-sm text-gray-600">IPs bloqueadas</div>
          </div>

          {/* Active Users */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              --
            </div>
            <div className="text-sm text-gray-600">Usuarios activos</div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <span className="font-medium text-gray-900">Rate Limiting</span>
            </div>
            <div className="text-xl font-bold text-gray-900">
              --
            </div>
            <div className="text-sm text-gray-600">Límites alcanzados</div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-gray-900">Actividad Sospechosa</span>
            </div>
            <div className="text-xl font-bold text-gray-900">
              --
            </div>
            <div className="text-sm text-gray-600">Eventos detectados</div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">Intentos Fallidos</span>
            </div>
            <div className="text-xl font-bold text-gray-900">
              {formatNumber(data.intentosFallidos24h)}
            </div>
            <div className="text-sm text-gray-600">Total de fallos</div>
          </div>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Failed IPs */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">IPs con más fallos</h3>
            <div className="space-y-2">
              {data.topIpsSospechosas.length > 0 ? (
                 data.topIpsSospechosas.map((item, index) => (
                   <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                     <div>
                       <div className="font-medium text-gray-900">{item.ip}</div>
                     </div>
                     <div className="text-right">
                       <div className="font-bold text-red-600">{item.intentos}</div>
                      <div className="text-xs text-gray-500">intentos</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  No hay datos disponibles
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad reciente</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <div className="text-center text-gray-500 py-4">
                Funcionalidad en desarrollo
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityStats;