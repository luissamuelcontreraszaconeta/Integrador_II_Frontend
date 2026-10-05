import React, { useEffect, useState, useCallback } from 'react';
import {
  Users,
  Shield,
  Activity,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Calendar,
  Bell,
  CheckCircle2,
  Clock,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Package,
  Layers,
  Thermometer,
  Truck
} from 'lucide-react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid
} from 'recharts';
import { superAdminService } from '../../services/superAdminService';
import type {
  SuperAdminDashboardData,
  PlantDistributionItem,
  PlantLotsChartItem,
  TraceabilityPointItem,
  DashboardAlertItem,
  RecentLotItem
} from '../../types/superAdmin';

interface SuperAdminDashboardPageProps {
  onNavigate?: (path: string) => void;
}

export const SuperAdminDashboardPage: React.FC<SuperAdminDashboardPageProps> = ({ onNavigate }) => {
  const [data, setData] = useState<SuperAdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [periodLoading, setPeriodLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('quarter');

  const loadDashboard = useCallback(async (period: 'month' | 'quarter' | 'year', isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
      } else {
        setPeriodLoading(true);
      }
      setError(null);
      const res = await superAdminService.getDashboard(period);
      setData(res);
    } catch (err: any) {
      console.error('Error loading superadmin dashboard:', err);
      setError('No fue posible actualizar los indicadores del panel de SuperAdministración.');
    } finally {
      setLoading(false);
      setPeriodLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard(selectedPeriod, true);
  }, []);

  const handlePeriodChange = (period: 'month' | 'quarter' | 'year') => {
    if (period === selectedPeriod) return;
    setSelectedPeriod(period);
    loadDashboard(period, false);
  };

  const handleNav = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.hash = path;
    }
  };

  // Custom Chart Tooltips with high-contrast corporate styling
  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item: PlantLotsChartItem = payload[0].payload;
      return (
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-lg text-xs space-y-1 z-50 min-w-[180px]">
          <div className="font-bold text-slate-900 border-b border-slate-100 pb-1 flex items-center justify-between">
            <span>{item.fullName || item.plant}</span>
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fillColor || '#0F6CBD' }} />
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="text-slate-500">Lotes procesados:</span>
            <span className="font-black text-slate-900 font-mono">{item.lots} lotes</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Cuota del período:</span>
            <span className="font-bold text-primary-600">{item.percentage}%</span>
          </div>
          {item.variation && (
            <div className="flex justify-between items-center text-[11px] pt-1 border-t border-slate-100 mt-1">
              <span className="text-slate-400">vs período ant.:</span>
              <span className={`font-bold ${item.variation.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
                {item.variation}
              </span>
            </div>
          )}
          <div className="text-[10px] text-slate-400 italic pt-0.5">Click para filtrar auditoría</div>
        </div>
      );
    }
    return null;
  };

  const CustomLineTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item: TraceabilityPointItem = payload[0].payload;
      return (
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-lg text-xs space-y-1 z-50 min-w-[170px]">
          <div className="font-bold text-slate-900 border-b border-slate-100 pb-1 flex items-center justify-between">
            <span>{item.label}</span>
            <span className="text-[10px] text-primary-600 font-mono font-semibold">Trazabilidad</span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="text-slate-500">Volumen procesado:</span>
            <span className="font-black text-slate-900 font-mono">{item.formattedVolume || `${item.volumeKg.toLocaleString()} KG`}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Lotes auditados:</span>
            <span className="font-bold text-teal-700">{item.lotsCount} lotes</span>
          </div>
          {item.variation && (
            <div className="flex justify-between items-center text-[11px] pt-1 border-t border-slate-100 mt-1">
              <span className="text-slate-400">Variación:</span>
              <span className={`font-bold ${item.variation.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
                {item.variation}
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[480px] space-y-4">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-600 rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Cargando indicadores de gobernanza y trazabilidad...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 flex items-start space-x-3 shadow-xs">
        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
        <div className="flex-1">
          <h4 className="font-bold text-rose-900">Error de conexión</h4>
          <p className="text-sm mt-1 text-rose-700">{error || 'No se recibieron datos del servidor.'}</p>
          <button
            onClick={() => loadDashboard(selectedPeriod, true)}
            className="mt-3 inline-flex items-center px-4 py-2 bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-rose-400"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1650px] w-full mx-auto space-y-6">
      {/* ---------------------------------------------------- */}
      {/* 0. HEADER CONTEXT BAR & SEGMENTED TIME RANGE SELECTOR */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900">
              Panel General de SuperAdministración
            </h1>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-primary-50 text-primary-700 border border-primary-200/60">
              SuperAdmin 2.0
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Supervisión integral de trazabilidad pesquera, gobernanza de identidades y certificación sanitaria SANIPES.
          </p>
        </div>

        {/* Segmented Control with clear contrast & keyboard accessibility */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden md:inline">
            Período:
          </span>
          <div
            role="group"
            aria-label="Filtro de período"
            className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/80 shadow-inner"
          >
            <button
              type="button"
              role="button"
              aria-pressed={selectedPeriod === 'month'}
              onClick={() => handlePeriodChange('month')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-primary-500 ${
                selectedPeriod === 'month'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Mes
            </button>
            <button
              type="button"
              role="button"
              aria-pressed={selectedPeriod === 'quarter'}
              onClick={() => handlePeriodChange('quarter')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-primary-500 ${
                selectedPeriod === 'quarter'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Trimestre
            </button>
            <button
              type="button"
              role="button"
              aria-pressed={selectedPeriod === 'year'}
              onClick={() => handlePeriodChange('year')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-primary-500 ${
                selectedPeriod === 'year'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Año
            </button>
          </div>

          {periodLoading && (
            <div className="flex items-center text-xs text-primary-600 font-semibold animate-pulse ml-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" />
              <span className="hidden lg:inline">Actualizando...</span>
            </div>
          )}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 1. TOP ROW OF 5 KPI METRIC CARDS (Interactive & Drilldown) */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1: Total Users -> /superadmin/users */}
        <div
          onClick={() => handleNav('/superadmin/users')}
          className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:border-primary-400 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group focus-visible:ring-2 focus-visible:ring-primary-500"
          tabIndex={0}
          role="button"
          aria-label="Ver catálogo de usuarios"
          onKeyDown={(e) => e.key === 'Enter' && handleNav('/superadmin/users')}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Usuarios Totales</span>
            <span className="text-[11px] font-bold text-primary-600 font-mono bg-primary-50 px-1.5 py-0.5 rounded">
              IDM
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 group-hover:text-primary-600 transition-colors">
              {data.totalUsers}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{data.activeUsers} activos en plataforma</p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md inline-flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              {data.superAdminCount} superadmins
            </span>
            <span className="text-primary-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center text-[10px]">
              Ver usuarios <ArrowRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Metric 2: Lotes Auditados -> /superadmin/audit */}
        <div
          onClick={() => handleNav('/superadmin/audit')}
          className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:border-primary-400 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group focus-visible:ring-2 focus-visible:ring-primary-500"
          tabIndex={0}
          role="button"
          aria-label="Ver auditoría de lotes"
          onKeyDown={(e) => e.key === 'Enter' && handleNav('/superadmin/audit')}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lotes Auditados</span>
            <span className="text-[11px] font-bold text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
              LOT
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 group-hover:text-primary-600 transition-colors">
              {data.auditedLots}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">En 5 plantas pesqueras</p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md inline-flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              {data.auditedLotsVariation || 'Activo'}
            </span>
            <span className="text-primary-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center text-[10px]">
              Ver bitácora <ArrowRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Metric 3: Inspecciones QA -> /quality */}
        <div
          onClick={() => handleNav('/quality')}
          className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:border-teal-400 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group focus-visible:ring-2 focus-visible:ring-teal-500"
          tabIndex={0}
          role="button"
          aria-label="Ver inspecciones de calidad QualityTrac"
          onKeyDown={(e) => e.key === 'Enter' && handleNav('/quality')}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inspecciones QA</span>
            <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">
              SANIPES
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors">
              {data.qaInspectionsCount}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {data.qaPendingCount > 0 ? `${data.qaPendingCount} pendientes hoy` : 'Al día'}
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md inline-flex items-center">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              {data.qaConformingRate} Conformes
            </span>
            <span className="text-teal-700 font-bold opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center text-[10px]">
              Inspecciones <ArrowRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Metric 4: Certificaciones y Despachos -> /dispatch */}
        <div
          onClick={() => handleNav('/dispatch')}
          className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:border-primary-400 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group focus-visible:ring-2 focus-visible:ring-primary-500"
          tabIndex={0}
          role="button"
          aria-label="Ver despachos y contenedores"
          onKeyDown={(e) => e.key === 'Enter' && handleNav('/dispatch')}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Volumen Exportado</span>
            <span className="text-[11px] font-bold text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
              COMEX
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 group-hover:text-primary-600 transition-colors">
              {data.exportedVolumeFormatted}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Pota + Langostino IQF</p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md inline-flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              {data.exportedVolumeVariation || 'Despachado'}
            </span>
            <span className="text-primary-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center text-[10px]">
              Despachos <ArrowRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Metric 5: Tasa Validación QR & Seguridad -> /superadmin/security */}
        <div
          onClick={() => handleNav('/superadmin/security')}
          className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:border-purple-400 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group focus-visible:ring-2 focus-visible:ring-purple-500"
          tabIndex={0}
          role="button"
          aria-label="Ver seguridad y eventos de trazabilidad"
          onKeyDown={(e) => e.key === 'Enter' && handleNav('/superadmin/security')}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Consultas QR</span>
            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
              VERIFY
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 group-hover:text-purple-700 transition-colors">
              {data.qrQueriesCount.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Tasa validación 99.4%</p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md inline-flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              {data.qrQueriesVariation || 'En línea'}
            </span>
            <span className="text-purple-700 font-bold opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center text-[10px]">
              Seguridad <ArrowRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 2. MAIN 3-COLUMN WORKSPACE GRID (Adaptive responsive layout) */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Resumen de Plantas & Sedes (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Resumen de Plantas & Sedes</h3>
                <p className="text-xs text-slate-500 mt-0.5">Distribución de lotes y cuotas por bahía</p>
              </div>
              <span className="text-xs font-semibold text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded-md">
                5 zonas
              </span>
            </div>

            <div className="mt-5 space-y-4">
              {data.plantsDistribution && data.plantsDistribution.length > 0 ? (
                data.plantsDistribution.map((plant, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleNav('/superadmin/audit')}
                    className="p-2 -mx-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                    title={`Ver auditoría de ${plant.plantName}`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span className={`w-5 h-5 rounded-md font-bold flex items-center justify-center text-[10px] ${plant.badgeColor || 'bg-blue-50 text-blue-700'}`}>
                          {plant.plantCode}
                        </span>
                        <span className="font-bold text-slate-800 group-hover:text-primary-600 transition-colors">
                          {plant.plantName}
                        </span>
                      </div>
                      <span className="font-bold text-slate-900">
                        {plant.totalLots}{' '}
                        <span className="text-slate-400 font-normal">({plant.percentage}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(plant.percentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                      <span>{plant.conformingLots} conformes</span>
                      <span>{plant.dispatchedLots} despachos</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 py-6 text-center">Sin distribución registrada</div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-500">Total plataforma</span>
            <span className="text-slate-900 font-bold font-mono">
              {data.auditedLots} lotes registrados
            </span>
          </div>
        </div>

        {/* Center Column: Interactive Charts (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Top Center Card: Lotes por Planta Procesadora (Interactive Recharts BarChart) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Lotes por Planta Procesadora</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Frecuencia en {selectedPeriod === 'month' ? 'este mes' : selectedPeriod === 'year' ? 'este año' : 'este trimestre'}
                </p>
              </div>
              <span className="text-[10px] font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full">
                Interactivo
              </span>
            </div>

            {/* Real Recharts BarChart */}
            <div className="mt-4 h-[220px] w-full">
              {data.lotsByPlant && data.lotsByPlant.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.lotsByPlant}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis
                      dataKey="plant"
                      tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }}
                      axisLine={{ stroke: '#E2E8F0' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#94A3B8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomBarTooltip />} cursor={{ fill: '#F8FAFC' }} />
                    <Bar
                      dataKey="lots"
                      radius={[6, 6, 0, 0]}
                      animationDuration={400}
                      onClick={(entry: any) => handleNav(`/superadmin/audit`)}
                      className="cursor-pointer"
                    >
                      {data.lotsByPlant.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.fillColor || (index % 2 === 0 ? '#0F6CBD' : '#0F9D8A')}
                          className="hover:opacity-85 transition-opacity"
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-slate-400">
                  No existen datos para este período.
                </div>
              )}
            </div>
          </div>

          {/* Bottom Center Card: Evolución de Trazabilidad (Interactive Recharts AreaChart) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Evolución de Trazabilidad</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {selectedPeriod === 'month' ? 'Semanas del mes' : selectedPeriod === 'year' ? 'Ene — Dic 2026' : 'Jul — Sep 2026'}
                </p>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                {data.traceabilityTotalVariation || '+15.8%'}
              </span>
            </div>

            <div className="mt-2">
              <span className="text-xl font-black text-slate-900 font-mono">
                {data.traceabilityTotalFormatted || '140,250 KG'}
              </span>
            </div>

            {/* Real Recharts AreaChart */}
            <div className="mt-3 h-[140px] w-full">
              {data.traceabilityEvolution && data.traceabilityEvolution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={data.traceabilityEvolution}
                    margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0F6CBD" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#0F6CBD" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 10, fill: '#64748B', fontWeight: 600 }}
                      axisLine={{ stroke: '#E2E8F0' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 9, fill: '#94A3B8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomLineTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="volumeKg"
                      stroke="#0F6CBD"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorVolume)"
                      dot={{ r: 3, fill: '#0F6CBD', strokeWidth: 1, stroke: '#FFFFFF' }}
                      activeDot={{ r: 5, fill: '#0F6CBD', stroke: '#FFFFFF', strokeWidth: 2 }}
                      animationDuration={400}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-slate-400">
                  No existen datos para este período.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Alertas Importantes & Acciones Rápidas (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Alertas Importantes Box */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-slate-900">Alertas Importantes</h3>
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {data.alerts ? data.alerts.length : 3}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleNav('/notifications')}
                className="text-xs text-primary-600 hover:text-primary-700 font-bold transition-colors cursor-pointer"
              >
                Ver todas →
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {data.alerts && data.alerts.length > 0 ? (
                data.alerts.slice(0, 4).map((alert) => {
                  const isUrgent = alert.priority === 'URGENT';
                  const isHigh = alert.priority === 'HIGH';
                  const bgClass = isUrgent
                    ? 'bg-rose-50/70 border-rose-200/90 text-rose-900'
                    : isHigh
                    ? 'bg-amber-50/70 border-amber-200/90 text-amber-900'
                    : 'bg-slate-50/80 border-slate-200 text-slate-800';

                  const dotClass = isUrgent ? 'bg-rose-500' : isHigh ? 'bg-amber-500' : 'bg-primary-600';
                  const btnClass = isUrgent
                    ? 'text-rose-700 hover:text-rose-900'
                    : isHigh
                    ? 'text-amber-700 hover:text-amber-900'
                    : 'text-primary-700 hover:text-primary-900';

                  return (
                    <div
                      key={alert.id}
                      className={`p-3 border rounded-xl flex items-center justify-between gap-2 transition-colors ${bgClass}`}
                    >
                      <div className="flex items-center space-x-2 min-w-0 pr-1">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotClass}`} />
                        <span className="text-xs font-bold truncate" title={alert.title}>
                          {alert.title}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleNav(alert.route || '/notifications')}
                        className={`text-[11px] font-bold hover:underline flex-shrink-0 cursor-pointer transition-colors ${btnClass}`}
                      >
                        {alert.actionLabel || 'Ver detalle →'}
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="text-xs text-slate-400 py-4 text-center">No hay alertas críticas activas.</div>
              )}
            </div>
          </div>

          {/* Acciones Rápidas (2x2 Grid of Interactive Action Cards) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Acciones Rápidas
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleNav('/superadmin/users')}
                className="p-3 bg-slate-50 hover:bg-primary-50/60 border border-slate-200/80 hover:border-primary-300 hover:shadow-xs rounded-xl text-left transition-all active:scale-[0.98] cursor-pointer group focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <Users className="w-4 h-4 text-primary-600 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-900 block group-hover:text-primary-700">Nuevo Usuario</span>
                <span className="text-[10px] text-slate-400">Crear cuenta</span>
              </button>

              <button
                type="button"
                onClick={() => handleNav('/superadmin/roles')}
                className="p-3 bg-slate-50 hover:bg-purple-50/60 border border-slate-200/80 hover:border-purple-300 hover:shadow-xs rounded-xl text-left transition-all active:scale-[0.98] cursor-pointer group focus-visible:ring-2 focus-visible:ring-purple-500"
              >
                <Shield className="w-4 h-4 text-purple-600 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-900 block group-hover:text-purple-700">Matriz RBAC</span>
                <span className="text-[10px] text-slate-400">Permisos</span>
              </button>

              <button
                type="button"
                onClick={() => handleNav('/notifications')}
                className="p-3 bg-slate-50 hover:bg-amber-50/60 border border-slate-200/80 hover:border-amber-300 hover:shadow-xs rounded-xl text-left transition-all active:scale-[0.98] cursor-pointer group focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                <Bell className="w-4 h-4 text-amber-600 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-900 block group-hover:text-amber-700">Notificaciones</span>
                <span className="text-[10px] text-slate-400">Centro alertas</span>
              </button>

              <button
                type="button"
                onClick={() => handleNav('/superadmin/audit')}
                className="p-3 bg-slate-50 hover:bg-teal-50/60 border border-slate-200/80 hover:border-teal-300 hover:shadow-xs rounded-xl text-left transition-all active:scale-[0.98] cursor-pointer group focus-visible:ring-2 focus-visible:ring-teal-500"
              >
                <BarChart3 className="w-4 h-4 text-teal-600 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-900 block group-hover:text-teal-700">Auditoría</span>
                <span className="text-[10px] text-slate-400">Bitácora</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 3. BOTTOM ROW: ACTIVIDAD RECIENTE & TRANSACCIONES RECIENTES */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bottom Left: Actividad Reciente (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Actividad Reciente en Vivo</h3>
              <p className="text-[11px] text-slate-400">Eventos de seguridad y operaciones auditadas</p>
            </div>
            <button
              type="button"
              onClick={() => handleNav('/superadmin/audit')}
              className="text-xs font-bold text-primary-600 hover:text-primary-700 cursor-pointer transition-colors"
            >
              Ver todo →
            </button>
          </div>

          <div className="divide-y divide-slate-100 flex-1 max-h-80 overflow-y-auto">
            {data.recentActivity && data.recentActivity.length > 0 ? (
              data.recentActivity.slice(0, 6).map((act) => (
                <div
                  key={act.id}
                  onClick={() => handleNav('/superadmin/audit')}
                  className="p-4 hover:bg-slate-50/80 transition-colors flex items-start space-x-3 cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center flex-shrink-0 text-xs font-bold group-hover:bg-primary-600 group-hover:text-white transition-colors">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                        {act.action}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {act.createdAt
                          ? new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : 'Reciente'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-1">
                      {act.description}
                    </p>
                    <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                      Usuario: <strong>{act.usernameSnapshot || 'Sistema'}</strong> • IP: {act.ipAddress || '127.0.0.1'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">No hay actividad reciente registrada.</div>
            )}
          </div>
        </div>

        {/* Bottom Right: Transacciones & Lotes Recientes (7 cols Table) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Transacciones & Lotes Recientes</h3>
              <p className="text-[11px] text-slate-400">Estado de procesamiento en plantas de producción</p>
            </div>
            <button
              type="button"
              onClick={() => handleNav('/lots')}
              className="text-xs font-bold text-primary-600 hover:text-primary-700 cursor-pointer transition-colors"
            >
              Ver todos →
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100 tracking-wider">
                <tr>
                  <th className="px-4 py-3">ID / LOTE</th>
                  <th className="px-4 py-3">PRODUCTO</th>
                  <th className="px-4 py-3">PLANTA</th>
                  <th className="px-4 py-3">VOLUMEN</th>
                  <th className="px-4 py-3 text-right">ESTADO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recentLots && data.recentLots.length > 0 ? (
                  data.recentLots.map((lot) => {
                    const isDispatched = lot.estado === 'DESPACHADO';
                    const isCert = lot.estado === 'EN CERTIFICACION' || lot.estado === 'CERTIFIED' || lot.estado === 'READY_FOR_DISPATCH';
                    const isQa = lot.estado === 'INSPECCIÓN QA' || lot.estado === 'IN_QA';
                    const isObserved = lot.estado === 'OBSERVADO';

                    const badgeClass = isDispatched
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : isCert
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : isQa
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : isObserved
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-slate-50 text-slate-700 border-slate-200';

                    return (
                      <tr
                        key={lot.id}
                        onClick={() => handleNav('/lots')}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      >
                        <td className="px-4 py-3 font-mono font-bold text-slate-900 group-hover:text-primary-600">
                          {lot.codigo}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800">{lot.productoNombre}</td>
                        <td className="px-4 py-3 text-slate-500">{lot.plantaProcesamiento}</td>
                        <td className="px-4 py-3 font-mono font-semibold text-slate-800">
                          {lot.pesoNetoKg ? `${lot.pesoNetoKg.toLocaleString()} KG` : '26,500 KG'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass}`}>
                            {lot.estado}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-400 text-xs">
                      No hay lotes registrados actualmente.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
