import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  LayoutGrid,
  Route,
  FolderSearch,
  TriangleAlert,
  FilePenLine,
  UserPlus,
  UserCog,
  Clock,
  ArrowRight,
  FileClock,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import {
  RequiresApprovalBadge,
  ServiceSlaBadge,
} from '../../components/support/ServiceRequestBadges';
import { ServiceRequestModal } from '../../components/support/ServiceRequestModal';
import {
  SERVICE_CATALOG_CATEGORIES,
  SERVICE_CATALOG_ITEMS,
  ServiceCatalogCategoryKey,
  ServiceCatalogItem,
} from '../../types/serviceRequest';

interface ServiceCatalogPageProps {
  onNavigate?: (path: string) => void;
}

export const ServiceCatalogPage: React.FC<ServiceCatalogPageProps> = ({
  onNavigate,
}) => {
  const [selectedCategory, setSelectedCategory] =
    useState<ServiceCatalogCategoryKey>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] =
    useState<ServiceCatalogItem | null>(null);

  const navigateTo = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const filteredItems = useMemo(() => {
    return SERVICE_CATALOG_ITEMS.filter((item) => {
      if (selectedCategory !== 'ALL' && item.categoryKey !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        const matchCode = item.code.toLowerCase().includes(q);
        const matchCat = item.categoryLabel.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchCode && !matchCat) {
          return false;
        }
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  const renderCatalogIcon = (iconName: ServiceCatalogItem['iconName']) => {
    switch (iconName) {
      case 'Route':
        return <Route className="w-5 h-5" aria-hidden="true" />;
      case 'FolderSearch':
        return <FolderSearch className="w-5 h-5" aria-hidden="true" />;
      case 'TriangleAlert':
        return <TriangleAlert className="w-5 h-5" aria-hidden="true" />;
      case 'FilePenLine':
        return <FilePenLine className="w-5 h-5" aria-hidden="true" />;
      case 'UserPlus':
        return <UserPlus className="w-5 h-5" aria-hidden="true" />;
      case 'UserCog':
        return <UserCog className="w-5 h-5" aria-hidden="true" />;
      default:
        return <LayoutGrid className="w-5 h-5" aria-hidden="true" />;
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Encabezado Principal */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5 flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-[#0F6CBD] shrink-0" aria-hidden="true" />
                Catálogo de servicios
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Selecciona el servicio que necesitas y registra tu solicitud directamente desde ExporTrace.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-center shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigateTo('/support/requests')}
              icon={<FileClock className="w-4 h-4" />}
            >
              Mis solicitudes
            </Button>
          </div>
        </div>
      </div>

      {/* Filtros Superiores: Categorías + Buscador */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5">
        <div
          className="flex flex-wrap items-center gap-2"
          role="tablist"
          aria-label="Categorías del catálogo de servicios"
        >
          {SERVICE_CATALOG_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#0F4C81] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:w-80">
          <label htmlFor="catalog-search" className="sr-only">
            Buscar un servicio
          </label>
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="catalog-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar un servicio..."
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0F6CBD]/20 focus:border-[#0F6CBD] transition-all"
          />
        </div>
      </div>

      {/* Grid de Tarjetas del Catálogo */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center shadow-2xs space-y-2">
          <p className="text-sm font-bold text-slate-900">
            No se encontraron servicios para la búsqueda actual
          </p>
          <p className="text-xs text-slate-500">
            Prueba cambiando la categoría seleccionada o limpiando el término de búsqueda.
          </p>
          <div className="pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSelectedCategory('ALL');
                setSearchQuery('');
              }}
            >
              Mostrar todos los servicios
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {filteredItems.map((item) => (
            <div
              key={item.code}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-md hover:-translate-y-0.5 hover:border-[#0F6CBD]/40 transition-all duration-200 flex flex-col justify-between h-full"
            >
              {/* Parte superior de la tarjeta */}
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-100 text-[#0F6CBD] flex items-center justify-center shrink-0">
                    {renderCatalogIcon(item.iconName)}
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-1.5">
                    <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/80">
                      {item.code}
                    </span>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {item.categoryLabel}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-base font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Parte inferior consistente: SLA objetivo + Aprobación + Botón Seleccionar */}
              <div className="pt-4 mt-5 border-t border-slate-100 space-y-3.5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" aria-hidden="true" />
                      SLA objetivo
                    </span>
                    {item.requiresApproval && <RequiresApprovalBadge />}
                  </div>
                  <div>
                    <ServiceSlaBadge
                      slaLabel={item.slaTargetLabel}
                      className="w-full justify-start"
                    />
                  </div>
                </div>

                <div className="pt-1 flex justify-end">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full justify-center"
                    onClick={() => setSelectedService(item)}
                    icon={<ArrowRight className="w-4 h-4" />}
                  >
                    Seleccionar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Formulario por Servicio */}
      <ServiceRequestModal
        isOpen={Boolean(selectedService)}
        service={selectedService}
        onClose={() => setSelectedService(null)}
        onNavigate={onNavigate}
      />
    </div>
  );
};
