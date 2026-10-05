import React from 'react';
import { ColdChainRecord } from '../../types/lot';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { Thermometer, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ColdChainGraphProps {
  logs: ColdChainRecord[];
}

export const ColdChainGraph: React.FC<ColdChainGraphProps> = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-xl text-slate-500 shadow-2xs">
        <Thermometer className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-700">Sin registros de temperatura en cadena de frío</p>
        <p className="text-xs text-slate-500 mt-1">
          Regístrelos en el módulo QualityTrac para visualizar la curva de temperatura.
        </p>
      </div>
    );
  }

  const chartData = logs.map((log, idx) => ({
    name: `#${idx + 1} (${log.time})`,
    temperature: log.temperature,
    location: log.location,
    status: log.status,
  }));

  const hasCritical = logs.some((l) => l.status === 'CRITICAL');
  const hasWarning = logs.some((l) => l.status === 'WARNING');

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-[#0F6CBD]" />
            Curva de Control de Cadena de Frío (°C)
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">Límite normativo SANIPES: congelación profunda &le; -18.0 °C</p>
        </div>

        <div className="flex items-center gap-2">
          {hasCritical ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 shadow-2xs">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Alerta Térmica
            </span>
          ) : hasWarning ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1 shadow-2xs">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Advertencia
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Normal (-18°C OK)
            </span>
          )}
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="name" stroke="#64748B" fontSize={11} tick={{ fill: '#64748B' }} />
            <YAxis domain={[-30, -5]} stroke="#64748B" fontSize={11} unit="°C" tick={{ fill: '#64748B' }} />
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
            <ReferenceLine
              y={-18}
              label={{ value: 'Límite SANIPES -18°C', fill: '#DC2626', fontSize: 10, position: 'insideTopRight' }}
              stroke="#DC2626"
              strokeDasharray="4 4"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="temperature"
              name="Temperatura (°C)"
              stroke="#0F9D8A"
              strokeWidth={3}
              dot={{ r: 5, fill: '#0F9D8A', stroke: '#FFFFFF', strokeWidth: 2 }}
              activeDot={{ r: 8, fill: '#0F6CBD' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
