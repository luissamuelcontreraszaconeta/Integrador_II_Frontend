import React from 'react';
import { useLots } from '../../context/LotContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { StatsCard } from '../../components/ui/StatsCard';
import { DataTable, Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Lot } from '../../types/lot';
import { ShieldCheck, Clock, CheckCircle2, AlertTriangle, Eye, Plus } from 'lucide-react';

interface QualityDashboardPageProps {
  onNavigate: (path: string) => void;
}

export const QualityDashboardPage: React.FC<QualityDashboardPageProps> = ({ onNavigate }) => {
  const { lots } = useLots();

  const qaPending = lots.filter((l) => l.status === 'PENDING_QA' || l.status === 'IN_QA');
  const qaConformes = lots.filter((l) => l.qa && l.qa.organolepticResult === 'CONFORME');
  const qaObservados = lots.filter((l) => l.status === 'OBSERVED');
  const coldChainAlerts = lots.filter((l) => l.coldChainLogs.some((c) => c.status === 'CRITICAL'));

  const columns: Column<Lot>[] = [
    {
      header: 'Código Lote',
      accessorKey: 'code',
      cell: (item) => (
        <span className="font-bold text-teal-400">{item.code}</span>
      ),
    },
    {
      header: 'Producto',
      cell: (item) => (
        <div>
          <span className="font-semibold text-slate-100 block text-xs">{item.production.productName}</span>
          <span className="text-[10px] text-slate-400">Embarcación: {item.production.vesselName}</span>
        </div>
      ),
    },
    {
      header: 'Estado QA',
      cell: (item) => <StatusBadge status={item.status} size="sm" />,
    },
    {
      header: 'Resultado Organoléptico',
      cell: (item) => (
        <span className={`text-xs font-bold ${item.qa?.organolepticResult === 'CONFORME' ? 'text-emerald-400' : item.qa ? 'text-rose-400' : 'text-amber-400'}`}>
          {item.qa ? item.qa.organolepticResult : 'PENDIENTE INSPECCION'}
        </span>
      ),
    },
    {
      header: 'Acciones QA',
      cell: (item) => (
        <div className="flex items-center gap-2">
          <Button
            variant="teal"
            size="sm"
            onClick={() => onNavigate(`/quality/inspect/${item.id}`)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Inspeccionar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate(`/lots/${item.id}`)}
            icon={<Eye className="w-3.5 h-3.5" />}
          >
            Detalle
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="QualityTrac | Control de Calidad Sanitaria"
        subtitle="Módulo de auditoría organoléptica y vigilancia de parámetros fisicoquímicos en planta"
        breadcrumbs={[{ label: 'Inicio', onClick: () => onNavigate('/dashboard') }, { label: 'QualityTrac' }]}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Lotes Pendientes QA"
          value={qaPending.length}
          subtitle="Esperando auditoría"
          icon={<Clock className="w-5 h-5" />}
          color="amber"
        />
        <StatsCard
          title="Lotes Conformes"
          value={qaConformes.length}
          subtitle="Aprobados por QA"
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="emerald"
        />
        <StatsCard
          title="Lotes Observados"
          value={qaObservados.length}
          subtitle="Desviación detectada"
          icon={<AlertTriangle className="w-5 h-5" />}
          color="rose"
        />
        <StatsCard
          title="Alertas Cadena Frío"
          value={coldChainAlerts.length}
          subtitle="T° > -18°C"
          icon={<ShieldCheck className="w-5 h-5" />}
          color="purple"
        />
      </div>

      {/* Table of Lots requiring QA Inspection */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-100">Bandeja de Control de Calidad</h3>
        <DataTable columns={columns} data={lots} keyExtractor={(item) => item.id} />
      </div>
    </div>
  );
};
