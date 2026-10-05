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
            className="font-bold text-[#0F6CBD] hover:text-[#0D5CA0] hover:underline cursor-pointer"
          >
            {item.code}
          </button>
          <span className="text-[10px] text-slate-500 block italic">{item.production.scientificName}</span>
        </div>
      ),
    },
    {
      header: 'Producto',
      accessorKey: 'production',
      cell: (item) => (
        <div>
          <span className="font-semibold text-slate-800 block text-xs">{item.production.productName}</span>
          <span className="text-[10px] text-slate-500">Orig: {item.production.vesselName}</span>
        </div>
      ),
    },
    {
      header: 'Cantidad',
      cell: (item) => (
        <span className="font-mono font-bold text-slate-900 text-xs">
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
          variant="outline"
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
        title="Panel General de Control y Trazabilidad"
        subtitle="Resumen en tiempo real de lotes pesqueros, control de calidad y certificación sanitaria"
        actions={
          (currentRole === 'ADMINISTRADOR' || currentRole === 'PRODUCCION') && (
            <Button
              variant="teal"
              size="md"
              onClick={() => onNavigate('/lots/new')}
              icon={<Plus className="w-4 h-4" />}
            >
              Registrar Lote
            </Button>
          )
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Total Lotes"
          value={totalLots}
          subtitle="Lotes en sistema"
          icon={<Package className="w-5 h-5" />}
          color="blue"
        />
        <StatsCard
          title="Conformes / Aptos"
          value={conformes}
          subtitle="Calidad verificada"
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="emerald"
        />
        <StatsCard
          title="Observados"
          value={observados}
          subtitle="Requieren acción"
          icon={<AlertTriangle className="w-5 h-5" />}
          color="rose"
        />
        <StatsCard
          title="En Certificación"
          value={enCertificacion}
          subtitle="Trámite SANIPES"
          icon={<Award className="w-5 h-5" />}
          color="purple"
        />
        <StatsCard
          title="Listos Despacho"
          value={readyForDispatch}
          subtitle="Aptos p/ aduanas"
          icon={<Truck className="w-5 h-5" />}
          color="teal"
        />
      </div>

      {/* Alerts for critical states */}
      {observados > 0 && (
        <AlertCard
          type="warning"
          title="Lotes con Observaciones Sanitarias o de Calidad"
          message={`Existen ${observados} lote(s) que requieren subsanación de observaciones por el área de QA o Logística antes de continuar con la certificación.`}
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigate('/lots')}
              icon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Revisar Lotes
            </Button>
          }
        />
      )}

      {/* Main Grid: Chart + Quick Access Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Volume by Hydrobiological Product */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#0F6CBD]" />
                Volumen Procesado por Especie Hidrobiológica (TN)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Distribución de materia prima auditada para exportación</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-[#0F6CBD] border border-blue-100">
              Mes Activo
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tick={{ fill: '#64748B' }} />
                <YAxis stroke="#64748B" fontSize={11} unit=" TN" tick={{ fill: '#64748B' }} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: '8px',
                    color: '#1E293B',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px'
                  }}
                  labelStyle={{ color: '#0F4C81', fontWeight: 'bold' }}
                />
                <Bar dataKey="Volumen" name="Volumen (TN)" fill="#0F6CBD" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Key Operational Quick Actions */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0F9D8A]" />
                Accesos Rápidos de Gestión
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Operaciones prioritarias según su área</p>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => onNavigate('/quality')}
                className="w-full text-left p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-300 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div>
                  <span className="text-xs font-bold text-slate-800 group-hover:text-[#0F6CBD] block">
                    QualityTrac &bull; Control QA
                  </span>
                  <span className="text-[11px] text-slate-500">Evaluación organoléptica y cadena de frío</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0F6CBD] group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={() => onNavigate('/certification')}
                className="w-full text-left p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-300 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div>
                  <span className="text-xs font-bold text-slate-800 group-hover:text-[#0F6CBD] block">
                    SANIPES &bull; Certificaciones
                  </span>
                  <span className="text-[11px] text-slate-500">Seguimiento de expedientes digitales</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0F6CBD] group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={() => onNavigate('/dispatch')}
                className="w-full text-left p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-300 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div>
                  <span className="text-xs font-bold text-slate-800 group-hover:text-[#0F6CBD] block">
                    LogisTrac &bull; Despachos
                  </span>
                  <span className="text-[11px] text-slate-500">Autorización de salida y DUA Comex</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0F6CBD] group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-teal-50/70 border border-teal-200 text-xs text-teal-900 space-y-1">
            <span className="font-bold block">Trazabilidad Segura</span>
            <p className="text-[11px] text-teal-800 leading-snug">
              Todos los lotes cuentan con firma digital y código QR inmutable conforme a normativas sanitarias.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Lots Table Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Lotes Recientes en Proceso</h3>
            <p className="text-xs text-slate-500 mt-0.5">Últimos registros hidrobiológicos bajo seguimiento</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('/lots')}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Ver Todos los Lotes
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={lots.slice(0, 5)}
          keyExtractor={(item) => item.id}
          emptyMessage="No hay lotes registrados actualmente en el sistema."
        />
      </div>
    </div>
  );
};
