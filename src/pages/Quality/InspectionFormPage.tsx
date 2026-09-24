import React, { useState } from 'react';
import { useLots } from '../../context/LotContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { ShieldCheck, Upload, Save, X, Camera } from 'lucide-react';

interface InspectionFormPageProps {
  lotId: string;
  onNavigate: (path: string) => void;
}

export const InspectionFormPage: React.FC<InspectionFormPageProps> = ({ lotId, onNavigate }) => {
  const { getLotById, updateQAInspection } = useLots();
  const lot = getLotById(lotId);

  const [appearance, setAppearance] = useState<'EXCELENTE' | 'BUENO' | 'REGULAR' | 'DEFECTUOSO'>('EXCELENTE');
  const [color, setColor] = useState<'CONFORME' | 'OBSERVADO'>('CONFORME');
  const [texture, setTexture] = useState<'CONFORME' | 'FIRM' | 'BLANDA'>('FIRM');
  const [smell, setSmell] = useState<'CARACTERISTICO' | 'OBSERVADO'>('CARACTERISTICO');
  const [parasiteCheck, setParasiteCheck] = useState<'AUSENCIA' | 'PRESENCIA'>('AUSENCIA');
  const [organolepticResult, setOrganolepticResult] = useState<'CONFORME' | 'OBSERVADO' | 'NO_CONFORME'>('CONFORME');
  const [observations, setObservations] = useState('Auditoría organoléptica ejecutada según protocolo SANIPES.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!lot) {
    return <div className="p-8 text-slate-400">Lote no encontrado</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateQAInspection(lot.id, {
        appearance,
        color,
        texture,
        smell,
        parasiteCheck,
        organolepticResult,
        observations,
        evidenceUrls: [
          'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&auto=format&fit=crop&q=80',
        ],
      });
      onNavigate(`/lots/${lot.id}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title={`Inspección Organoléptica QA - ${lot.code}`}
        subtitle={`Evaluación técnica de parámetros sensoriales para: ${lot.production.productName}`}
        breadcrumbs={[
          { label: 'Inicio', onClick: () => onNavigate('/dashboard') },
          { label: 'QualityTrac', onClick: () => onNavigate('/quality') },
          { label: `Inspección ${lot.code}` },
        ]}
      />

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
        <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
          <ShieldCheck className="w-5 h-5 text-teal-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
            Formulario de Auditoría de Calidad
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Apariencia General"
            value={appearance}
            onChange={(e) => setAppearance(e.target.value as any)}
            options={[
              { value: 'EXCELENTE', label: 'Excelente (Superficie brillante, pulpa uniforme)' },
              { value: 'BUENO', label: 'Bueno (Conforme)' },
              { value: 'REGULAR', label: 'Regular (Leve alteración visual)' },
              { value: 'DEFECTUOSO', label: 'Defectuoso (No apto)' },
            ]}
          />

          <Select
            label="Coloración de la Pulpa"
            value={color}
            onChange={(e) => setColor(e.target.value as any)}
            options={[
              { value: 'CONFORME', label: 'Conforme (Blanco nacarado / característico)' },
              { value: 'OBSERVADO', label: 'Observado (Amarillento / Manchado)' },
            ]}
          />

          <Select
            label="Textura Muscular"
            value={texture}
            onChange={(e) => setTexture(e.target.value as any)}
            options={[
              { value: 'FIRM', label: 'Firme y Elástica (Turgente)' },
              { value: 'CONFORME', label: 'Conforme' },
              { value: 'BLANDA', label: 'Blanda / Flácida (Desviación térmica)' },
            ]}
          />

          <Select
            label="Olor Característico"
            value={smell}
            onChange={(e) => setSmell(e.target.value as any)}
            options={[
              { value: 'CARACTERISTICO', label: 'Característico a mar fresco' },
              { value: 'OBSERVADO', label: 'Observado / Amoniacal' },
            ]}
          />

          <Select
            label="Examen de Parásitos (Anisakis / Kudoa)"
            value={parasiteCheck}
            onChange={(e) => setParasiteCheck(e.target.value as any)}
            options={[
              { value: 'AUSENCIA', label: 'Ausencia total de quistes o larva' },
              { value: 'PRESENCIA', label: 'Presencia detectada (Rechazo)' },
            ]}
          />

          <Select
            label="Resultado Global de Inspección"
            value={organolepticResult}
            onChange={(e) => setOrganolepticResult(e.target.value as any)}
            options={[
              { value: 'CONFORME', label: 'CONFORME (Apto para consumo y exportación)' },
              { value: 'OBSERVADO', label: 'OBSERVADO (Requiere re-inspección o reproceso)' },
              { value: 'NO_CONFORME', label: 'NO CONFORME (Rechazo sanitario)' },
            ]}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Observaciones Detalladas del Inspector QA
          </label>
          <textarea
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
            rows={3}
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
          />
        </div>

        {/* Evidence attachment simulation */}
        <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-teal-400" />
            Adjuntar Evidencia Fotográfica Muestreada
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => alert('Simulador de captura de fotos QA activado. Imagen adjuntada.')}
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" /> Subir Fotografía Muestra (.JPG)
            </button>
            <span className="text-xs text-emerald-400">1 imagen muestreada simulada</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button variant="outline" size="md" type="button" onClick={() => onNavigate(`/lots/${lot.id}`)} icon={<X className="w-4 h-4" />}>
            Cancelar
          </Button>
          <Button variant="teal" size="md" type="submit" isLoading={isSubmitting} icon={<Save className="w-4 h-4" />}>
            Guardar Inspección QA
          </Button>
        </div>
      </form>
    </div>
  );
};
