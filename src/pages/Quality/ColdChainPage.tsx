import React, { useState } from 'react';
import { useLots } from '../../context/LotContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ColdChainGraph } from '../../components/lots/ColdChainGraph';
import { Thermometer, Plus, Send, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ColdChainPageProps {
  onNavigate: (path: string) => void;
}

export const ColdChainPage: React.FC<ColdChainPageProps> = ({ onNavigate }) => {
  const { lots, addColdChainLog } = useLots();
  const [selectedLotId, setSelectedLotId] = useState<string>(lots[0]?.id || '');
  const [temp, setTemp] = useState<number>(-21.0);
  const [location, setLocation] = useState('Cámara N° 01 - Almacén Paita');
  const [responsible, setResponsible] = useState('María Elena Quispe');
  const [obs, setObs] = useState('Auditoría térmica de rutina');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedLot = lots.find((l) => l.id === selectedLotId) || lots[0];

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLotId) return;
    setIsSubmitting(true);
    try {
      await addColdChainLog(selectedLotId, Number(temp), location, obs);
      setObs('Auditoría térmica de rutina');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Control Manual de Cadena de Frío"
        subtitle="Vigilancia normativa de temperatura para conservación de congelados (-18°C)"
        breadcrumbs={[
          { label: 'Inicio', onClick: () => onNavigate('/dashboard') },
          { label: 'QualityTrac', onClick: () => onNavigate('/quality') },
          { label: 'Cadena de Frío' },
        ]}
      />

      {/* Lot selector bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-96">
          <Thermometer className="w-5 h-5 text-cyan-400 shrink-0" />
          <Select
            label="Seleccionar Lote para Auditoría Térmica"
            value={selectedLotId}
            onChange={(e) => setSelectedLotId(e.target.value)}
            options={lots.map((l) => ({
              value: l.id,
              label: `${l.code} - ${l.production.productName}`,
            }))}
          />
        </div>
      </div>

      {selectedLot && (
        <div className="space-y-6">
          {/* Temperature Chart */}
          <ColdChainGraph logs={selectedLot.coldChainLogs} />

          {/* Form + History Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Manual Log Form */}
            <form
              onSubmit={handleAddLog}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4"
            >
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Plus className="w-4 h-4 text-teal-400" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-100">
                  Nuevo Registro Manual de T°
                </h4>
              </div>

              <Input
                label="Temperatura Leída (°C)"
                type="number"
                step="0.1"
                required
                value={temp}
                onChange={(e) => setTemp(Number(e.target.value))}
                helperText="Límite SANIPES: ≤ -18.0°C"
              />

              <Input
                label="Ubicación / Cámara Frigorífica"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />

              <Input
                label="Inspector Responsable"
                required
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
              />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Observaciones
                </label>
                <textarea
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  rows={2}
                  value={obs}
                  onChange={(e) => setObs(e.target.value)}
                />
              </div>

              <Button
                variant="teal"
                size="md"
                type="submit"
                isLoading={isSubmitting}
                className="w-full"
                icon={<Send className="w-4 h-4" />}
              >
                Guardar Lectura de T°
              </Button>
            </form>

            {/* Right: Detailed Logs Table */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-100 border-b border-slate-800 pb-3">
                Historial de Lecturas Registradas ({selectedLot.code})
              </h4>

              {selectedLot.coldChainLogs.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">Sin registros manuales para este lote.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-3">Fecha y Hora</th>
                        <th className="p-3">T° Leída</th>
                        <th className="p-3">Cámara / Ubicación</th>
                        <th className="p-3">Responsable</th>
                        <th className="p-3">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {selectedLot.coldChainLogs.map((log) => (
                        <tr key={log.id}>
                          <td className="p-3 font-mono">{new Date(log.recordedAt).toLocaleDateString()} {log.time}</td>
                          <td className="p-3 font-bold font-mono text-cyan-300 text-sm">{log.temperature}°C</td>
                          <td className="p-3">{log.location}</td>
                          <td className="p-3">{log.responsible}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                log.status === 'NORMAL'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : log.status === 'WARNING'
                                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                  : 'bg-rose-950 text-rose-300 border border-rose-800'
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
