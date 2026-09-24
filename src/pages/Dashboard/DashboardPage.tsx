import React from 'react';
import { useLots } from '../../context/LotContext';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { StatsCard } from '../../components/ui/StatsCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { AlertCard } from '../../components/ui/AlertCard';
import { Lot } from '../../types/lot';
import { 
  Package, 
  CheckCircle2, 
  AlertTriangle, 
  Award, 
  Truck, 
  Plus, 
  ArrowRight, 
  TrendingUp, 
  Eye, 
  ShieldCheck 
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from 'recharts';

interface DashboardPageProps {
  onNavigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { lots } = useLots();
  const { currentRole } = useAuth();

  const totalLots = lots.length;
  const conformes = lots.filter(
    (l) => l.status === 'CERTIFIED' || l.status === 'READY_FOR_DISPATCH' || l.status === 'DISPATCHED'
  ).length;
  const observados = lots.filter((l) => l.status === 'OBSERVED' || l.status === 'CERTIFICATION_OBSERVED').length;
  const enCertificacion = lots.filter((l) => l.status === 'IN_CERTIFICATION').length;
  const readyForDispatch = lots.filter((l) => l.status === 'READY_FOR_DISPATCH').length;

  const chartData = [
    { name: 'Pota Block', Volumen: 26.5, Lotes: 3 },
    { name: 'Langostino', Volumen: 18.2, Lotes: 2 },
    { name: 'Merluza HG', Volumen: 14.8, Lotes: 2 },
    { name: 'Pota Anillos', Volumen: 21.0, Lotes: 1 },
    { name: 'Abanico', Volumen: 9.5, Lotes: 1 },
  ];

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
          <span className="text-[10px] text-slate-500 block">{item.production.scientificName}</span>
        </div>
      ),
    },
    {
      header: 'Producto',
      accessorKey: 'production',
      cell: (item) => (
        <div>
          <span className="font-semibold text-slate-200 block text-xs">{item.production.productName}</span>
          <span className="text-[10px] text-slate-400">Orig: {item.production.vesselName}</span>
        </div>
      ),
    },
    {
      header: 'Cantidad',
      cell: (item) => (
        <span className="font-mono font-bold text-slate-200 text-xs">
          {item.production.quantity} {item.production.unit}
        </span>
      ),
    },
    {
      header: 'Estado General',
      cell: (item) => <StatusBadge status={item.status} size="sm" />,
    },
    {
      header: 'Acción',
      cell: (item) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate(`/lots/${item.id}`)}
          icon={<Eye className="w-3.5 h-3.5" />}
        >
          Ver Lote
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard General de Trazabilidad"
        subtitle={`Vista consolidada enterprise para el rol: ${currentRole}`}
        breadcrumbs={[{ label: 'Inicio' }, { label: 'Dashboard' }]}
        actions={
          (currentRole === 'ADMINISTRADOR' || currentRole === 'PRODUCCION') && (
            <Button
              variant="teal"
              size="md"
              onClick={() => onNavigate('/lots/new')}
              icon={<Plus className="w-4 h-4" />}
            >
              + Registrar Lote
            </Button>
          )
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Total Lotes"
          value={totalLots}
          subtitle="Registrados en sistema"
          icon={<Package className="w-5 h-5" />}
          color="blue"
        />
        <StatsCard
          title="Lotes Conformes"
          value={conformes}
          subtitle="Calidad & SANIPES OK"
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="emerald"
        />
        <StatsCard
          title="Lotes Observados"
          value={observados}
          subtitle="Requieren subsanación"
          icon={<AlertTriangle className="w-5 h-5" />}
          color="rose"
        />
        <StatsCard
          title="En Certificación"
          value={enCertificacion}
          subtitle="En trámite SANIPES"
          icon={<Award className="w-5 h-5" />}
          color="purple"
        />
        <StatsCard
          title="Aptos Despacho"
          value={readyForDispatch}
          subtitle="Listos para embarque"
          icon={<Truck className="w-5 h-5" />}
          color="teal"
        />
      </div>

      {/* Main Charts & Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Volume Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-400" />
                Volumen Exportable por Producto (Toneladas)
              </h3>
              <p className="text-xs text-slate-400">Distribución de masa pesquera en proceso de certificación</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Bar dataKey="Volumen" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Active System Alerts */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            Alertas Críticas de Operación
          </h3>
          <div className="space-y-3">
            {observados > 0 && (
              <AlertCard
                type="warning"
                title="Lotes Observados en Planta"
                message="Lote EXP-2026-004 tiene alerta térmica en cámara fría (-14.2°C). Notificado a Inspector QA."
              />
            )}
            <AlertCard
              type="info"
              title="Mesa de Partes SANIPES"
              message="2 expedientes digitales en evaluación por la Oficina SANIPES Paita."
            />
            <AlertCard
              type="success"
              title="Despacho Autorizado"
              message="Lote EXP-2026-001 listo para contenedor MSCU-982341-0 destino Valencia."
            />
          </div>
        </div>
      </div>

      {/* Priority Lots Data Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-100">Lotes en Seguimiento Prioritario</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('/lots')}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Ver todos los lotes
          </Button>
        </div>

        <DataTable columns={columns} data={lots.slice(0, 5)} keyExtractor={(item) => item.id} />
      </div>
    </div>
  );
};
