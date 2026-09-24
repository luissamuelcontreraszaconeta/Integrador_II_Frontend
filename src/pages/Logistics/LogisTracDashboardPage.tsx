import React from 'react';
import { useLots } from '../../context/LotContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable, Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Lot } from '../../types/lot';
import { CheckCircle2, XCircle, Clock, Eye, Award, Truck } from 'lucide-react';

interface LogisTracDashboardPageProps {
  onNavigate: (path: string) => void;
}

export const LogisTracDashboardPage: React.FC<LogisTracDashboardPageProps> = ({ onNavigate }) => {
  const { lots } = useLots();

  const columns: Column<Lot>[] = [
    {
      header: 'Código Lote',
      accessorKey: 'code',
      cell: (item) => (
        <div>
          <button
            onClick={() => onNavigate(`/lots/${item.id}`)}
            className="font-bold text-teal-400 hover:underline cursor-pointer"
          >
            {item.code}
          </button>
          <span className="text-[10px] text-slate-500 block">{item.production.productName}</span>
        </div>
      ),
    },
    {
      header: 'Producción',
      cell: () => (
        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-xs">
          <CheckCircle2 className="w-3.5 h-3.5" /> Completa
        </span>
      ),
    },
    {
      header: 'Calidad QA',
      cell: (item) => (
        item.qa?.organolepticResult === 'CONFORME' ? (
          <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" /> Conforme
          </span>
        ) : item.qa ? (
          <span className="inline-flex items-center gap-1 text-rose-400 font-bold text-xs">
            <XCircle className="w-3.5 h-3.5" /> Observado
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-amber-400 font-bold text-xs">
            <Clock className="w-3.5 h-3.5" /> Pendiente
          </span>
        )
      ),
    },
    {
      header: 'Cadena Frío',
      cell: (item) => (
        item.coldChainLogs.length > 0 && !item.coldChainLogs.some((c) => c.status === 'CRITICAL') ? (
          <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" /> Conforme
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-rose-400 font-bold text-xs">
            <XCircle className="w-3.5 h-3.5" /> Alerta/Pendiente
          </span>
        )
      ),
    },
    {
      header: 'Documentación',
      cell: (item) => (
        item.documents.length >= 2 ? (
          <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completa ({item.documents.length})
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-amber-400 font-bold text-xs">
            <Clock className="w-3.5 h-3.5" /> Faltantes
          </span>
        )
      ),
    },
    {
      header: 'Certificación SANIPES',
      cell: (item) => <StatusBadge status={item.status} size="sm" />,
    },
    {
      header: 'Acciones Logísticas',
      cell: (item) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate(`/lots/${item.id}`)}
            icon={<Eye className="w-3.5 h-3.5" />}
          >
            Detalle Lote
          </Button>
          {(item.status === 'READY_FOR_CERTIFICATION' || item.status === 'VALIDATION_PENDING') && (
            <Button
              variant="teal"
              size="sm"
              onClick={() => onNavigate(`/certification`)}
              icon={<Award className="w-3.5 h-3.5" />}
            >
              Certificar
            </Button>
          )}
          {(item.status === 'CERTIFIED' || item.status === 'READY_FOR_DISPATCH') && (
            <Button
              variant="teal"
              size="sm"
              onClick={() => onNavigate(`/dispatch/${item.id}`)}
              icon={<Truck className="w-3.5 h-3.5" />}
            >
              Despachar
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="LogisTrac | Matriz de Preparación Logística"
        subtitle="Consolidación de estado integral por lote previa a certificación y autorización de despacho"
        breadcrumbs={[{ label: 'Inicio', onClick: () => onNavigate('/dashboard') }, { label: 'LogisTrac' }]}
      />

      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-100">Matriz Integral de Lotes Pesqueros</h3>
        <DataTable columns={columns} data={lots} keyExtractor={(item) => item.id} />
      </div>
    </div>
  );
};
