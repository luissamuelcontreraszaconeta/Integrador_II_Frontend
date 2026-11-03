import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  ClipboardList,
  Search,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Eye,
  Clock,
  ChevronLeft,
  ChevronRight,
  LifeBuoy,
} from 'lucide-react';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { AlertCard } from '../../components/ui/AlertCard';
import { IncidentPriorityBadge } from '../../components/support/IncidentPriorityBadge';
import { IncidentStatusBadge } from '../../components/support/IncidentStatusBadge';
import { ReportIncidentModal } from '../../components/support/ReportIncidentModal';
import { incidentService } from '../../services/incidentService';
import { ApiError } from '../../services/apiClient';
import {
  IncidentDTO,
  IncidentCategory,
  IncidentPriority,
  IncidentStatus,
  INCIDENT_CATEGORY_OPTIONS,
  INCIDENT_CATEGORY_LABELS,
  INCIDENT_PRIORITY_LABELS,
  INCIDENT_STATUS_LABELS,
  INCIDENT_SLA_ESTIMATE_TARGETS,
  JIRA_SYNC_USER_LABELS,
} from '../../types/incident';

interface MyIncidentsPageProps {
  onNavigate?: (path: string) => void;
}

const PAGE_SIZE = 8;

export const MyIncidentsPage: React.FC<MyIncidentsPageProps> = ({ onNavigate }) => {
  const [incidents, setIncidents] = useState<IncidentDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<IncidentPriority | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<IncidentCategory | 'ALL'>('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Modal state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const navigateTo = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const loadMyIncidents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await incidentService.getMyIncidents();
      setIncidents(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      if (apiErr?.status === 403) {
        setError('No tienes permiso para consultar incidencias en este momento.');
      } else {
        setError(
          apiErr?.message ||
            'No se pudieron cargar tus incidencias. Verifica tu conexión e intenta nuevamente.'
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMyIncidents();
  }, [loadMyIncidents]);

  const filteredIncidents = useMemo(() => {
    return incidents.filter((item) => {
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
      if (priorityFilter !== 'ALL' && item.priority !== priorityFilter) return false;
      if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchCode = item.code?.toLowerCase().includes(q);
        const matchSummary = item.summary?.toLowerCase().includes(q);
        const matchLot = item.relatedLotCode?.toLowerCase().includes(q);
        if (!matchCode && !matchSummary && !matchLot) return false;
      }
      return true;
    });
  }, [incidents, statusFilter, priorityFilter, categoryFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredIncidents.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedIncidents = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredIncidents.slice(start, start + PAGE_SIZE);
  }, [filteredIncidents, safePage]);

  const formatDate = (iso?: string) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  const columns: Column<IncidentDTO>[] = [
    {
      header: 'Código',
      cell: (item) => (
        <button
          type="button"
          onClick={() => navigateTo(`/support/incidents/${item.id}`)}
          className="font-mono font-bold text-xs text-[#0F4C81] hover:text-[#0F6CBD] hover:underline cursor-pointer"
        >
          {item.code}
        </button>
      ),
    },
    {
      header: 'Incidencia',
      cell: (item) => (
        <div className="max-w-xs">
          <p className="font-semibold text-slate-900 text-xs truncate" title={item.summary}>
            {item.summary}
          </p>
          <span className="text-[11px] text-slate-500">
            {JIRA_SYNC_USER_LABELS[item.syncStatus] || 'Registrada'}
            {item.relatedLotCode ? ` • Lote ${item.relatedLotCode}` : ''}
          </span>
        </div>
      ),
    },
    {
      header: 'Categoría',
      cell: (item) => (
        <span className="text-xs font-medium text-slate-700">
          {INCIDENT_CATEGORY_LABELS[item.category] || item.categoryLabel}
        </span>
      ),
    },
    {
      header: 'Prioridad',
      cell: (item) => <IncidentPriorityBadge priority={item.priority} size="sm" />,
    },
    {
      header: 'Estado',
      cell: (item) => <IncidentStatusBadge status={item.status} size="sm" />,
    },
    {
      header: 'Fecha',
      cell: (item) => (
        <span className="text-xs font-mono text-slate-600">{formatDate(item.createdAt)}</span>
      ),
    },
    {
      header: 'SLA (Objetivo estimado)',
      cell: (item) => {
        const sla = INCIDENT_SLA_ESTIMATE_TARGETS[item.priority];
        return (
          <div className="text-[11px]">
            <span className="font-semibold text-slate-800 block">{sla?.summaryLabel || '—'}</span>
            <span className="text-slate-400">Tiempo objetivo estimado</span>
          </div>
        );
      },
    },
    {
      header: 'Última actualización',
      cell: (item) => (
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-mono text-slate-600">{formatDate(item.updatedAt)}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateTo(`/support/incidents/${item.id}`)}
            icon={<Eye className="w-3.5 h-3.5" />}
            aria-label={`Ver detalle de ${item.code}`}
          >
            Ver
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Encabezado */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <button
              type="button"
              onClick={() => navigateTo('/support')}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer mt-0.5"
              title="Volver al Centro de Soporte"
              aria-label="Volver al Centro de Soporte"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#0F6CBD] block">
                Centro de Soporte
              </span>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-[#0F6CBD]" aria-hidden="true" />
                Mis Incidencias
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Consulta el historial, prioridad calculada y estado de tus solicitudes registradas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-center">
            <Button
              variant="secondary"
              size="sm"
              onClick={loadMyIncidents}
              disabled={loading}
              icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            >
              Actualizar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsReportModalOpen(true)}
              icon={<AlertCircle className="w-4 h-4" />}
            >
              Reportar incidencia
            </Button>
          </div>
        </div>
      </div>

      {error && <AlertCard type="error" title="Error al cargar incidencias" message={error} />}

      {/* Empty State cuando el usuario aún no tiene ninguna incidencia registrada */}
      {!loading && !error && incidents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-2xs max-w-xl mx-auto my-4 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-100 text-[#0F6CBD] flex items-center justify-center mx-auto">
            <LifeBuoy className="w-7 h-7" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">
              No tienes incidencias reportadas.
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Si experimentas algún inconveniente con el registro de lotes, inspecciones QA, cadena de frío o certificaciones, puedes reportarlo aquí.
            </p>
          </div>
          <div className="pt-2">
            <Button
              variant="primary"
              onClick={() => setIsReportModalOpen(true)}
              icon={<AlertCircle className="w-4 h-4" />}
            >
              Reportar incidencia
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Barra de Filtros */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <label htmlFor="filter-search" className="sr-only">
                Buscar por código o título
              </label>
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="filter-search"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Buscar por código INC o título..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0F6CBD]/20 focus:border-[#0F6CBD]"
              />
            </div>

            <div>
              <label htmlFor="filter-status" className="sr-only">
                Filtrar por estado
              </label>
              <select
                id="filter-status"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as IncidentStatus | 'ALL');
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0F6CBD]/20 focus:border-[#0F6CBD] cursor-pointer"
              >
                <option value="ALL">Todos los estados</option>
                {(Object.keys(INCIDENT_STATUS_LABELS) as IncidentStatus[]).map((st) => (
                  <option key={st} value={st}>
                    {INCIDENT_STATUS_LABELS[st]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="filter-priority" className="sr-only">
                Filtrar por prioridad
              </label>
              <select
                id="filter-priority"
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value as IncidentPriority | 'ALL');
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0F6CBD]/20 focus:border-[#0F6CBD] cursor-pointer"
              >
                <option value="ALL">Todas las prioridades</option>
                {(Object.keys(INCIDENT_PRIORITY_LABELS) as IncidentPriority[]).map((pr) => (
                  <option key={pr} value={pr}>
                    {INCIDENT_PRIORITY_LABELS[pr]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="filter-category" className="sr-only">
                Filtrar por categoría
              </label>
              <select
                id="filter-category"
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value as IncidentCategory | 'ALL');
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0F6CBD]/20 focus:border-[#0F6CBD] cursor-pointer"
              >
                <option value="ALL">Todas las categorías</option>
                {INCIDENT_CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Vista Desktop: DataTable reutilizada */}
          <div className="hidden md:block">
            <DataTable
              columns={columns}
              data={paginatedIncidents}
              keyExtractor={(item) => String(item.id)}
              isLoading={loading}
              emptyMessage="No se encontraron incidencias que coincidan con los filtros seleccionados."
            />
          </div>

          {/* Vista Mobile: Tarjetas responsivas sin scroll horizontal */}
          <div className="md:hidden space-y-3">
            {loading ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                Cargando tus incidencias...
              </div>
            ) : paginatedIncidents.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                No se encontraron incidencias con los filtros aplicados.
              </div>
            ) : (
              paginatedIncidents.map((item) => {
                const sla = INCIDENT_SLA_ESTIMATE_TARGETS[item.priority];
                return (
                  <div
                    key={item.id}
                    onClick={() => navigateTo(`/support/incidents/${item.id}`)}
                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3 active:bg-slate-50 cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-xs text-[#0F4C81]">
                        {item.code}
                      </span>
                      <IncidentStatusBadge status={item.status} size="sm" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{item.summary}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {INCIDENT_CATEGORY_LABELS[item.category] || item.categoryLabel}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                      <IncidentPriorityBadge priority={item.priority} size="sm" />
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        SLA est.: {sla?.summaryLabel}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Controles de Paginación */}
          {!loading && filteredIncidents.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white rounded-xl border border-slate-200 px-4 py-3 text-xs text-slate-600">
              <span>
                Mostrando{' '}
                <strong className="text-slate-900">{paginatedIncidents.length}</strong> de{' '}
                <strong className="text-slate-900">{filteredIncidents.length}</strong> incidencias
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={safePage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  icon={<ChevronLeft className="w-3.5 h-3.5" />}
                >
                  Anterior
                </Button>
                <span className="font-semibold text-slate-800 px-2">
                  Página {safePage} de {totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={safePage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  Siguiente <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de Reporte */}
      <ReportIncidentModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSuccess={() => {
          loadMyIncidents();
        }}
        onNavigate={onNavigate}
      />
    </div>
  );
};
