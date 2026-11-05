import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ArrowLeft,
  Search,
  RefreshCw,
  LayoutGrid,
  FileClock,
  Eye,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import {
  ServiceRequestStatusBadge,
  ServiceRequestSyncBadge,
  ServiceSlaBadge,
} from '../../components/support/ServiceRequestBadges';
import { serviceRequestService } from '../../services/serviceRequestService';
import {
  ServiceRequestRecord,
  ServiceRequestStatus,
  ServiceCatalogCategoryKey,
  SERVICE_REQUEST_STATUS_LABELS,
} from '../../types/serviceRequest';

interface MyServiceRequestsPageProps {
  onNavigate?: (path: string) => void;
}

const PAGE_SIZE = 8;

export const MyServiceRequestsPage: React.FC<MyServiceRequestsPageProps> = ({
  onNavigate,
}) => {
  const [requests, setRequests] = useState<ServiceRequestRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ServiceRequestStatus | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] =
    useState<ServiceCatalogCategoryKey>('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  const navigateTo = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await serviceRequestService.getMyRequests();
      setRequests(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const filteredRequests = useMemo(() => {
    return requests.filter((item) => {
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
      if (categoryFilter !== 'ALL' && item.categoryKey !== categoryFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchCode = item.code.toLowerCase().includes(q);
        const matchTitle = item.serviceTitle.toLowerCase().includes(q);
        const matchSummary = item.summary.toLowerCase().includes(q);
        const matchServiceCode = item.serviceCode.toLowerCase().includes(q);
        if (!matchCode && !matchTitle && !matchSummary && !matchServiceCode) {
          return false;
        }
      }
      return true;
    });
  }, [requests, statusFilter, categoryFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedRequests = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredRequests.slice(start, start + PAGE_SIZE);
  }, [filteredRequests, safePage]);

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

  const columns: Column<ServiceRequestRecord>[] = [
    {
      header: 'Código',
      cell: (item) => (
        <button
          type="button"
          onClick={() => navigateTo(`/support/requests/${item.id}`)}
          className="font-mono font-bold text-xs text-[#0F4C81] hover:text-[#0F6CBD] hover:underline cursor-pointer"
        >
          {item.code}
        </button>
      ),
    },
    {
      header: 'Servicio',
      cell: (item) => (
        <div className="max-w-xs">
          <p
            className="font-semibold text-slate-900 text-xs truncate"
            title={item.serviceTitle}
          >
            {item.serviceTitle}
          </p>
          <span
            className="text-[11px] text-slate-500 block truncate"
            title={item.summary}
          >
            {item.serviceCode} • {item.summary}
          </span>
        </div>
      ),
    },
    {
      header: 'Estado',
      cell: (item) => <ServiceRequestStatusBadge status={item.status} size="sm" />,
    },
    {
      header: 'Fecha',
      cell: (item) => (
        <span className="text-xs font-mono text-slate-600">
          {formatDate(item.createdAt)}
        </span>
      ),
    },
    {
      header: 'SLA objetivo',
      cell: (item) => <ServiceSlaBadge slaLabel={item.slaTargetLabel} />,
    },
    {
      header: 'Sincronización',
      cell: (item) => (
        <ServiceRequestSyncBadge syncStatus={item.syncStatus} size="sm" />
      ),
    },
    {
      header: 'Jira',
      cell: (item) => (
        <div className="flex items-center justify-between gap-2">
          {item.jiraIssueKey ? (
            <span className="font-mono text-xs font-bold text-[#0F4C81] bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
              {item.jiraIssueKey}
            </span>
          ) : (
            <span className="text-xs font-mono text-slate-400">—</span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateTo(`/support/requests/${item.id}`)}
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
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer mt-0.5 shrink-0"
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
                <FileClock className="w-5 h-5 text-[#0F6CBD]" aria-hidden="true" />
                Mis solicitudes
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Revisa el avance, aprobaciones, SLA objetivo y estado de atención de tus solicitudes de servicio.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={loadRequests}
              disabled={loading}
              icon={
                <RefreshCw
                  className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}
                />
              }
            >
              Actualizar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigateTo('/support/catalog')}
              icon={<LayoutGrid className="w-4 h-4" />}
            >
              Catálogo de servicios
            </Button>
          </div>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <label htmlFor="sr-filter-search" className="sr-only">
            Buscar solicitud por código o servicio
          </label>
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="sr-filter-search"
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar por código SR, servicio o resumen..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0F6CBD]/20 focus:border-[#0F6CBD]"
          />
        </div>

        <div>
          <label htmlFor="sr-filter-status" className="sr-only">
            Filtrar por estado
          </label>
          <select
            id="sr-filter-status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as ServiceRequestStatus | 'ALL');
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0F6CBD]/20 focus:border-[#0F6CBD] cursor-pointer"
          >
            <option value="ALL">Todos los estados</option>
            {(
              Object.keys(SERVICE_REQUEST_STATUS_LABELS) as ServiceRequestStatus[]
            ).map((st) => (
              <option key={st} value={st}>
                {SERVICE_REQUEST_STATUS_LABELS[st]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="sr-filter-category" className="sr-only">
            Filtrar por categoría
          </label>
          <select
            id="sr-filter-category"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value as ServiceCatalogCategoryKey);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0F6CBD]/20 focus:border-[#0F6CBD] cursor-pointer"
          >
            <option value="ALL">Todas las categorías</option>
            <option value="INFORMATION">Solicitudes de información</option>
            <option value="ACCESS">Solicitudes de acceso</option>
          </select>
        </div>
      </div>

      {/* Vista Desktop: Tabla */}
      <div className="hidden md:block">
        <DataTable
          columns={columns}
          data={paginatedRequests}
          keyExtractor={(item) => item.id}
          isLoading={loading}
          emptyMessage="No se encontraron solicitudes que coincidan con los filtros seleccionados."
        />
      </div>

      {/* Vista Mobile: Tarjetas responsivas */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
            Cargando tus solicitudes...
          </div>
        ) : paginatedRequests.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
            No se encontraron solicitudes con los filtros aplicados.
          </div>
        ) : (
          paginatedRequests.map((item) => (
            <div
              key={item.id}
              onClick={() => navigateTo(`/support/requests/${item.id}`)}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3 active:bg-slate-50 cursor-pointer"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-bold text-xs text-[#0F4C81]">
                  {item.code}
                </span>
                <ServiceRequestStatusBadge status={item.status} size="sm" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {item.serviceTitle}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{item.summary}</p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                <span className="flex items-center gap-1 font-medium text-[#0F4C81]">
                  <Clock className="w-3 h-3 text-[#0F6CBD]" />
                  {item.slaTargetLabel}
                </span>
                <div className="flex items-center gap-2">
                  <ServiceRequestSyncBadge
                    syncStatus={item.syncStatus}
                    size="sm"
                  />
                  <span className="font-mono text-slate-400">
                    Jira: {item.jiraIssueKey || '—'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Paginación */}
      {!loading && filteredRequests.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white rounded-xl border border-slate-200 px-4 py-3 text-xs text-slate-600">
          <span>
            Mostrando{' '}
            <strong className="text-slate-900">{paginatedRequests.length}</strong>{' '}
            de <strong className="text-slate-900">{filteredRequests.length}</strong>{' '}
            solicitudes
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
    </div>
  );
};
