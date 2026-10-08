import React, { useState, useEffect } from 'react';
import { useLots } from '../../context/LotContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ColdChainGraph } from '../../components/lots/ColdChainGraph';
import { coldChainApiService } from '../../services/qualityService';
import { ColdChainIncident, ThermalProfile } from '../../types/quality';
import { Thermometer, Plus, Send, AlertTriangle, ShieldCheck, CheckCircle2, Clock, Info } from 'lucide-react';

interface ColdChainPageProps {
  onNavigate: (path: string) => void;
}

export const ColdChainPage: React.FC<ColdChainPageProps> = ({ onNavigate }) => {
  const { lots, addColdChainLog, refreshData } = useLots();
  const [selectedLotId, setSelectedLotId] = useState<string>(lots[0]?.id || '');
  const [temp, setTemp] = useState<number>(-21.0);
  const [location, setLocation] = useState('Cámara N° 01 - Almacén Paita');
  const [responsible, setResponsible] = useState('María Elena Quispe');
  const [obs, setObs] = useState('Auditoría térmica de rutina');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Thermal Profile & Incidents
  const [thermalProfile, setThermalProfile] = useState<ThermalProfile | null>(null);
  const [incidents, setIncidents] = useState<ColdChainIncident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<ColdChainIncident | null>(null);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [techJustification, setTechJustification] = useState('');
  const [actionsTaken, setActionsTaken] = useState('Re-estabilización en túnel de congelación y verificación con termómetro patrón.');
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  const selectedLot = lots.find((l) => l.id === selectedLotId) || lots[0];

  useEffect(() => {
    if (selectedLot?.id) {
      loadThermalData(selectedLot.id);
    }
  }, [selectedLot?.id]);

  const loadThermalData = async (lotId: string) => {
    try {
      const [profile, incs] = await Promise.all([
        coldChainApiService.getThermalProfile(lotId),
        coldChainApiService.getIncidentsByLotId(lotId),
      ]);
      setThermalProfile(profile);
      setIncidents(incs || []);
    } catch {
      // Fallback
    }
  };

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLotId) return;
    setIsSubmitting(true);
    try {
      await coldChainApiService.addTemperatureLog(selectedLotId, {
        temperature: Number(temp),
        location,
        responsible,
        observations: obs,
      });
      await addColdChainLog(selectedLotId, Number(temp), location, obs);
      setObs('Auditoría térmica de rutina');
      await loadThermalData(selectedLotId);
      if (refreshData) await refreshData();
    } catch (err: any) {
      alert(err.message || 'Error al registrar temperatura');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenResolveModal = (incident: ColdChainIncident) => {
    setSelectedIncident(incident);
    setTechJustification('');
    setResolveError(null);
    setIsResolveModalOpen(true);
  };

  const handleResolveIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident) return;
    if (techJustification.trim().length < 15) {
      setResolveError('La justificación técnica debe contener al menos 15 caracteres descriptivos.');
      return;
    }

    setIsResolving(true);
    setResolveError(null);
    try {
      await coldChainApiService.resolveIncident(selectedIncident.id, {
        technicalJustification: techJustification.trim(),
        actionsTaken: actionsTaken.trim(),
        observations: 'Subsanación técnica formal completada por inspector QA.',
      });
      setIsResolveModalOpen(false);
      await loadThermalData(selectedLot.id);
      if (refreshData) await refreshData();
    } catch (err: any) {
      setResolveError(err.message || 'Error al resolver la incidencia.');
    } finally {
      setIsResolving(false);
    }
  };

  const activeIncidents = incidents.filter((i) => i.status === 'ACTIVE' || i.status === 'UNDER_REVIEW');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Control Centralizado de Cadena de Frío"
        subtitle="Vigilancia normativa de temperatura por perfil paramétrico de especie y gestión de incidencias"
        breadcrumbs={[
          { label: 'Inicio', onClick: () => onNavigate('/dashboard') },
          { label: 'QualityTrac', onClick: () => onNavigate('/quality') },
          { label: 'Cadena de Frío' },
        ]}
      />

      {/* Lot selector bar + Thermal Profile Badge */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-96">
          <Thermometer className="w-5 h-5 text-[#0F6CBD] shrink-0" />
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

        {thermalProfile && (
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-lg text-xs">
            <div className="p-1.5 bg-[#0F6CBD]/10 rounded-md text-[#0F6CBD]">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-800">
                Perfil:{' '}
                <span className="text-[#0F6CBD] font-mono">
                  {thermalProfile.conservationType}
                </span>{' '}
                ({thermalProfile.normativeReference})
              </div>
              <div className="text-slate-500 text-[11px]">
                Rango Óptimo: [{thermalProfile.optimalMin}°C a {thermalProfile.optimalMax}°C] | Límite Crítico: &gt; {thermalProfile.criticalMax}°C
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active Incidents Alert Banner */}
      {activeIncidents.length > 0 && (
        <div className="bg-rose-50 border border-rose-300 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500 text-white rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-900">
                ALERTA DE CADENA DE FRÍO ACTIVA ({activeIncidents.length} Desviación Pendiente)
              </h4>
              <p className="text-xs text-rose-700 mt-0.5">
                El lote registra una lectura crítica de {activeIncidents[0].temperatureRead}°C (Límite:{' '}
                {activeIncidents[0].temperatureLimit}°C). El avance a Certificación / Despacho está bloqueado preventivamente.
              </p>
            </div>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleOpenResolveModal(activeIncidents[0])}
            icon={<ShieldCheck className="w-4 h-4" />}
          >
            Subsanar Incidencia (QA)
          </Button>
        </div>
      )}

      {selectedLot && (
        <div className="space-y-6">
          {/* Temperature Chart */}
          <ColdChainGraph logs={selectedLot.coldChainLogs} />

          {/* Form + History Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Manual Log Form */}
            <form
              onSubmit={handleAddLog}
              className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4"
            >
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                <Plus className="w-4 h-4 text-[#0F6CBD]" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">
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
                helperText={
                  thermalProfile
                    ? `Norma ${thermalProfile.conservationType}: Óptimo ≤ ${thermalProfile.optimalMax}°C | Crítico > ${thermalProfile.criticalMax}°C`
                    : 'Rango admitido: -80.0°C a +60.0°C'
                }
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
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Observaciones
                </label>
                <textarea
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F6CBD]/20 focus:border-[#0F6CBD]"
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

            {/* Right: Detailed Logs & Incidents Table */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-3">
                  Historial de Lecturas Térmicas ({selectedLot.code})
                </h4>

                {selectedLot.coldChainLogs.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">Sin registros manuales para este lote.</p>
                ) : (
                  <div className="overflow-x-auto mt-3">
                    <table className="w-full text-xs text-left text-slate-700">
                      <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Fecha y Hora</th>
                          <th className="p-3">T° Leída</th>
                          <th className="p-3">Cámara / Ubicación</th>
                          <th className="p-3">Responsable</th>
                          <th className="p-3">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedLot.coldChainLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/70">
                            <td className="p-3 font-mono">{new Date(log.recordedAt).toLocaleDateString()} {log.time}</td>
                            <td className="p-3 font-bold font-mono text-[#0F6CBD] text-sm">{log.temperature}°C</td>
                            <td className="p-3">{log.location}</td>
                            <td className="p-3">{log.responsible}</td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  log.status === 'NORMAL'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : log.status === 'WARNING'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
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

              {/* Incidents History */}
              {incidents.length > 0 && (
                <div className="border-t border-slate-200 pt-5">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-3 flex items-center justify-between">
                    <span>Incidencias Térmicas y Subsanaciones QA</span>
                    <span className="text-xs font-normal text-slate-500 font-mono">Total: {incidents.length}</span>
                  </h4>
                  <div className="space-y-3 mt-3">
                    {incidents.map((inc) => (
                      <div
                        key={inc.id}
                        className={`p-3.5 rounded-lg border text-xs ${
                          inc.status === 'RESOLVED'
                            ? 'bg-emerald-50/40 border-emerald-200'
                            : 'bg-rose-50/40 border-rose-200'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <div className="flex items-center gap-2">
                            {inc.status === 'RESOLVED' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Clock className="w-4 h-4 text-rose-600" />
                            )}
                            <span>
                              Desviación {inc.temperatureRead}°C (Límite: {inc.temperatureLimit}°C) — {inc.conservationType}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                              inc.status === 'RESOLVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {inc.status}
                          </span>
                        </div>
                        {inc.technicalJustification && (
                          <p className="mt-1.5 text-slate-700 italic">
                            <span className="font-semibold not-italic text-slate-900">Subsanación:</span> {inc.technicalJustification}
                          </p>
                        )}
                        <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                          <span>Reportado: {new Date(inc.createdAt).toLocaleString()}</span>
                          {inc.resolvedBy && <span>Resuelto por: {inc.resolvedBy}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* QA Resolve Incident Modal */}
      {isResolveModalOpen && selectedIncident && (
        <Modal
          isOpen={isResolveModalOpen}
          onClose={() => setIsResolveModalOpen(false)}
          title="Dictamen Técnico de Subsanación de Cadena de Frío (QA)"
        >
          <form onSubmit={handleResolveIncident} className="space-y-4">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-700">
              <div className="font-bold text-slate-900 mb-1">Datos de la Desviación:</div>
              <div>Lote: <span className="font-mono font-bold text-[#0F6CBD]">{selectedLot.code}</span></div>
              <div>Temperatura Crítica: <span className="font-bold text-rose-600">{selectedIncident.temperatureRead}°C</span></div>
              <div>Límite Normativo: <span className="font-bold">{selectedIncident.temperatureLimit}°C</span></div>
            </div>

            {resolveError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                {resolveError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Justificación Técnica de Subsanación (Mínimo 15 caracteres) *
              </label>
              <textarea
                required
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F6CBD]/20 focus:border-[#0F6CBD]"
                rows={3}
                placeholder="Detalle la causa técnica de la fluctuación y la verificación organoléptica de inocuidad..."
                value={techJustification}
                onChange={(e) => setTechJustification(e.target.value)}
              />
            </div>

            <Input
              label="Acciones Correctivas Tomadas"
              value={actionsTaken}
              onChange={(e) => setActionsTaken(e.target.value)}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="md"
                type="button"
                onClick={() => setIsResolveModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="md"
                type="submit"
                isLoading={isResolving}
                icon={<ShieldCheck className="w-4 h-4" />}
              >
                Aprobar Subsanación Técnica
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
