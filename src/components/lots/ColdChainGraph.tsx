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
      <div className="p-8 text-center bg-slate-900/50 border border-slate-800 rounded-xl text-slate-400">
        <Thermometer className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p className="text-sm font-medium">Sin registros de temperatura en cadena de frío</p>
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
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-cyan-400" />
            Curva de Control de Cadena de Frío (°C)
          </h4>
          <p className="text-xs text-slate-400">Límite normativo SANIPES: congelación profunda ≤ -18.0 °C</p>
        </div>

        <div className="flex items-center gap-2">
          {hasCritical ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" /> Alerta Térmica
            </span>
          ) : hasWarning ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" /> Advertencia
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Normal (-18°C OK)
            </span>
          )}
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
            <YAxis domain={[-30, -5]} stroke="#64748b" fontSize={11} unit="°C" />
            <RechartsTooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
              labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
            />
            <ReferenceLine
              y={-18}
              label={{ value: 'Límite SANIPES -18°C', fill: '#f43f5e', fontSize: 10, position: 'insideTopRight' }}
              stroke="#f43f5e"
              strokeDasharray="4 4"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="temperature"
              name="Temperatura (°C)"
              stroke="#06b6d4"
              strokeWidth={3}
              dot={{ r: 5, fill: '#06b6d4' }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
