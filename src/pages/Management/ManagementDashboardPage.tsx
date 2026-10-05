import React from 'react';
import { useLots } from '../../context/LotContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { StatsCard } from '../../components/ui/StatsCard';
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Truck, 
  Clock, 
  ShieldCheck 
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';

interface ManagementDashboardPageProps {
  onNavigate: (path: string) => void;
}

export const ManagementDashboardPage: React.FC<ManagementDashboardPageProps> = ({ onNavigate }) => {
  const { lots } = useLots();

  const totalLots = lots.length;
  const conformes = lots.filter(
    (l) => l.status === 'CERTIFIED' || l.status === 'READY_FOR_DISPATCH' || l.status === 'DISPATCHED'
  ).length;
  const percentConformity = totalLots > 0 ? Math.round((conformes / totalLots) * 100) : 100;
  const observadosCount = lots.filter((l) => l.status === 'OBSERVED').length;
  const dispatchedCount = lots.filter((l) => l.status === 'DISPATCHED').length;

  const pieData = [
    { name: 'Certificados / Aptos', value: conformes, color: '#0F9D8A' },
    { name: 'En Trámite SANIPES', value: lots.filter((l) => l.status === 'IN_CERTIFICATION').length, color: '#0F6CBD' },
    { name: 'En Control QA', value: lots.filter((l) => l.status === 'IN_QA' || l.status === 'PENDING_QA').length, color: '#EAA300' },
    { name: 'Observados', value: observadosCount, color: '#D83B01' },
  ];

  const trendData = [
    { mes: 'Mayo', Lotes: 12, Toneladas: 180, Certificados: 11 },
    { mes: 'Junio', Lotes: 18, Toneladas: 240, Certificados: 17 },
    { mes: 'Julio', Lotes: 22, Toneladas: 310, Certificados: 20 },
    { mes: 'Agosto', Lotes: totalLots, Toneladas: 89.5, Certificados: conformes },
  ];

  const observationsBreakdown = [
    { causa: 'Desviación térmica en cámara (-14°C)', cantidad: 4 },
    { causa: 'Falta Documento Pesaje / DJ', cantidad: 3 },
    { causa: 'Ablandamiento de textura muscular', cantidad: 2 },
    { causa: 'Pendiente informe microbiológico', cantidad: 1 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cuadro de Mando Ejecutivo (Gerencia)"
        subtitle="Analítica estratégica de trazabilidad, tasa de conformidad sanitaria y tiempos de certificación"
        breadcrumbs={[{ label: 'Inicio', onClick: () => onNavigate('/dashboard') }, { label: 'Gerencia' }]}
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Total Lotes Digitales"
          value={totalLots}
          subtitle="En plataforma"
          icon={<BarChart3 className="w-5 h-5" />}
          color="blue"
        />
        <StatsCard
          title="Tasa de Conformidad"
          value={`${percentConformity}%`}
          subtitle="Meta SANIPES: ≥ 95%"
          icon={<CheckCircle2 className="w-5 h-5" />}
          trend={{ value: '+4%', isPositive: true }}
          color="emerald"
        />
        <StatsCard
          title="Lotes Observados"
          value={observadosCount}
          subtitle="Pendientes de subsanación"
          icon={<AlertTriangle className="w-5 h-5" />}
          color="rose"
        />
        <StatsCard
          title="Tiempo Prom. Certificación"
          value="2.4 Días"
          subtitle="Mesa de partes SANIPES"
          icon={<Clock className="w-5 h-5" />}
          trend={{ value: '-0.8 días', isPositive: true }}
          color="purple"
        />
        <StatsCard
          title="Total Despachados"
          value={dispatchedCount}
          subtitle="Embarques concluidos"
          icon={<Truck className="w-5 h-5" />}
          color="teal"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Lot Status Pie Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0F9D8A]" />
            Distribución General por Estado del Lote
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', color: '#1E293B', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Monthly Trend Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#0F6CBD]" />
            Tendencia Mensual de Volumen Exportado (TN)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="mes" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', color: '#1E293B', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="Toneladas" stroke="#0F6CBD" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottleneck Analysis Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Principales Causas de Observaciones en Proceso
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Causa / Tipo de Observación</th>
                <th className="p-3">Impacto en Lotes</th>
                <th className="p-3">Acción Correctiva Sugerida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {observationsBreakdown.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50/70">
                  <td className="p-3 font-semibold text-slate-800">{item.causa}</td>
                  <td className="p-3 font-bold text-amber-600 font-mono">{item.cantidad} lotes</td>
                  <td className="p-3 text-slate-500">Calibración de túneles de congelación y auditoría de DJ previa.</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
