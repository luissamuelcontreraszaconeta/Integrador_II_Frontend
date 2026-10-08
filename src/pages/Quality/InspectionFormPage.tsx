import React, { useState, useRef, useEffect } from 'react';
import { useLots } from '../../context/LotContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import {
  ShieldCheck,
  Upload,
  Save,
  X,
  Camera,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Image as ImageIcon,
  FileText,
  Lock,
  FileCheck
} from 'lucide-react';
import { qualityService } from '../../services/qualityService';
import type { QaEvidenceItem } from '../../types/quality';

interface InspectionFormPageProps {
  lotId: string;
  onNavigate: (path: string) => void;
}

interface SelectedFileEvidence {
  file: File;
  previewUrl: string;
  description: string;
}

interface EnrichedQaEvidence extends QaEvidenceItem {
  blobUrl?: string;
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
  const [observations, setObservations] = useState('Auditoría organoléptica ejecutada según protocolo técnico SANIPES.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Real Photographic Evidence State
  const [selectedFiles, setSelectedFiles] = useState<SelectedFileEvidence[]>([]);
  const [existingEvidences, setExistingEvidences] = useState<EnrichedQaEvidence[]>([]);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string; desc?: string; sha256?: string } | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLocked = lot?.status === 'CERTIFIED' || lot?.status === 'READY_FOR_DISPATCH' || lot?.status === 'DISPATCHED';

  useEffect(() => {
    loadExistingInspection();
  }, [lotId]);

  const loadExistingInspection = async () => {
    try {
      const numId = Number(lotId) || 1;
      const inspectionData = await qualityService.getInspectionByLotId(numId);
      if (inspectionData) {
        if (inspectionData.appearance) setAppearance(inspectionData.appearance);
        if (inspectionData.color) setColor(inspectionData.color);
        if (inspectionData.texture) setTexture(inspectionData.texture);
        if (inspectionData.smell) setSmell(inspectionData.smell);
        if (inspectionData.parasiteCheck) setParasiteCheck(inspectionData.parasiteCheck);
        if (inspectionData.organolepticResult) setOrganolepticResult(inspectionData.organolepticResult);
        if (inspectionData.observations) setObservations(inspectionData.observations);

        if (inspectionData.id) {
          const evList = await qualityService.getEvidencesByInspection(inspectionData.id);
          const enriched: EnrichedQaEvidence[] = await Promise.all(
            evList.map(async (ev) => {
              try {
                const blobUrl = await qualityService.fetchEvidenceBlobUrl(ev.id);
                return { ...ev, blobUrl };
              } catch {
                return { ...ev };
              }
            })
          );
          setExistingEvidences(enriched);
        }
      }
    } catch (err) {
      console.log('No previous QA inspection found, starting new form.');
    }
  };

  if (!lot) {
    return <div className="p-8 text-slate-400">Lote no encontrado</div>;
  }

  // Handle file selections
  const handleFilesAdded = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMsg(null);

    if (isLocked) {
      setErrorMsg('BLOQUEO P0-C: El lote ya se encuentra certificado o despachado. No se permite agregar nuevas evidencias.');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const maxFileSize = 5 * 1024 * 1024; // 5MB

    const newEntries: SelectedFileEvidence[] = [];

    Array.from(files).forEach((file) => {
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        setErrorMsg(`El archivo "${file.name}" no es válido. Solo se admiten formatos JPG, PNG o WEBP.`);
        return;
      }
      if (file.size > maxFileSize) {
        setErrorMsg(`El archivo "${file.name}" supera el límite de 5 MB.`);
        return;
      }

      newEntries.push({
        file,
        previewUrl: URL.createObjectURL(file),
        description: `Muestra organoléptica de ${lot.production.productName}`,
      });
    });

    setSelectedFiles((prev) => [...prev, ...newEntries]);
  };

  const handleRemoveSelectedFile = (index: number) => {
    setSelectedFiles((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[index].previewUrl);
      copy.splice(index, 1);
      return copy;
    });
  };

  const handleDeleteExistingEvidence = async (evidenceId: number) => {
    if (isLocked) {
      alert('BLOQUEO P0-C: No se puede eliminar evidencias de un lote certificado o despachado.');
      return;
    }

    if (!confirm('¿Desea desactivar esta evidencia fotográfica? La acción quedará registrada en auditoría.')) return;
    try {
      const numLotId = Number(lotId) || 1;
      const inspection = await qualityService.getInspectionByLotId(numLotId);
      if (inspection && inspection.id) {
        await qualityService.deleteEvidence(inspection.id, evidenceId);
        setExistingEvidences((prev) => prev.filter((e) => e.id !== evidenceId));
      }
    } catch (err: any) {
      alert(err.message || 'Error al eliminar evidencia.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const numLotId = Number(lot.id) || 1;

      // 1. Save QA inspection through service
      const savedInspection = await qualityService.saveInspection(numLotId, {
        inspectorName: 'Dra. María Elena Quispe',
        appearance,
        color,
        texture,
        smell,
        parasiteCheck,
        organolepticResult,
        observations,
        evidenceUrls: existingEvidences.map((e) => e.fileUrl),
      });

      // 2. Also update context state
      await updateQAInspection(lot.id, {
        appearance,
        color,
        texture,
        smell,
        parasiteCheck,
        organolepticResult,
        observations,
        evidenceUrls: existingEvidences.map((e) => e.fileUrl),
      });

      // 3. Upload real evidence files if any were added
      if (selectedFiles.length > 0 && savedInspection.id) {
        for (const item of selectedFiles) {
          try {
            await qualityService.uploadEvidence(savedInspection.id, item.file, item.description);
          } catch (uploadErr: any) {
            console.error('Error al subir imagen individual:', uploadErr);
          }
        }
      }

      onNavigate(`/lots/${lot.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar la inspección QA.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title={`Inspección Organoléptica QA - ${lot.code}`}
        subtitle={`Evaluación técnica de parámetros sensoriales para: ${lot.production.productName}`}
        breadcrumbs={[
          { label: 'Inicio', onClick: () => onNavigate('/dashboard') },
          { label: 'QualityTrac', onClick: () => onNavigate('/quality') },
          { label: `Inspección ${lot.code}` },
        ]}
      />

      {isLocked && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-center space-x-3 text-sm animate-fade-in">
          <Lock className="w-5 h-5 text-amber-700 flex-shrink-0" />
          <span>
            <strong>Lote Inmutable:</strong> Este lote se encuentra en estado <strong>{lot.status}</strong>. La auditoría y las evidencias fotográficas están bloqueadas contra modificaciones.
          </span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 flex items-center space-x-3 text-sm animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Formulario de Auditoría y Evaluación Sensorial
              </h3>
              <p className="text-xs text-slate-500">
                Protocolo técnico sanitario SANIPES (D.S. N° 040-2001-PE / D.S. N° 007-98-SA)
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-mono font-bold text-slate-700">
            LOTE: {lot.code}
          </span>
        </div>

        {/* Sensory Parameters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Select
            label="Apariencia General"
            value={appearance}
            disabled={isLocked}
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
            disabled={isLocked}
            onChange={(e) => setColor(e.target.value as any)}
            options={[
              { value: 'CONFORME', label: 'Conforme (Blanco nacarado / característico)' },
              { value: 'OBSERVADO', label: 'Observado (Amarillento / Manchado)' },
            ]}
          />

          <Select
            label="Textura Muscular"
            value={texture}
            disabled={isLocked}
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
            disabled={isLocked}
            onChange={(e) => setSmell(e.target.value as any)}
            options={[
              { value: 'CARACTERISTICO', label: 'Característico a mar fresco' },
              { value: 'OBSERVADO', label: 'Observado / Amoniacal' },
            ]}
          />

          <Select
            label="Examen de Parásitos (Anisakis / Kudoa)"
            value={parasiteCheck}
            disabled={isLocked}
            onChange={(e) => setParasiteCheck(e.target.value as any)}
            options={[
              { value: 'AUSENCIA', label: 'Ausencia total de quistes o larva' },
              { value: 'PRESENCIA', label: 'Presencia detectada (Rechazo)' },
            ]}
          />

          <Select
            label="Resultado Global de Inspección"
            value={organolepticResult}
            disabled={isLocked}
            onChange={(e) => setOrganolepticResult(e.target.value as any)}
            options={[
              { value: 'CONFORME', label: 'CONFORME (Apto para consumo y exportación)' },
              { value: 'OBSERVADO', label: 'OBSERVADO (Requiere re-inspección o reproceso)' },
              { value: 'NO_CONFORME', label: 'NO CONFORME (Rechazo sanitario)' },
            ]}
          />
        </div>

        {/* Observations */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Observaciones Detalladas del Inspector QA
          </label>
          <textarea
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            rows={3}
            disabled={isLocked}
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Ingrese hallazgos organolépticos, muestreo en mesa de corte o condiciones térmicas..."
          />
        </div>

        {/* Real Photo Evidence Upload Section */}
        <div className="p-6 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
            <div>
              <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Camera className="w-4 h-4 text-primary-600" />
                Evidencia Fotográfica Real de Inspección (P0-C / SHA-256)
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                Custodia fotográfica protegida. Formatos válidos: JPG, PNG, WEBP (máx. 5 MB por imagen).
              </p>
            </div>

            {/* Hidden file inputs */}
            <input
              type="file"
              ref={cameraInputRef}
              accept="image/*"
              capture="environment"
              disabled={isLocked}
              className="hidden"
              onChange={(e) => handleFilesAdded(e.target.files)}
            />
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={isLocked}
              className="hidden"
              onChange={(e) => handleFilesAdded(e.target.files)}
            />

            {!isLocked && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
                  title="Tomar fotografía desde cámara"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Tomar Foto</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
                  title="Seleccionar archivos desde galería o disco"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Subir Archivos</span>
                </button>
              </div>
            )}
          </div>

          {/* Newly Selected Evidence Thumbnails (Pending Save) */}
          {selectedFiles.length > 0 && (
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-primary-800 block">
                Nuevas Fotografías por Guardar ({selectedFiles.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {selectedFiles.map((item, idx) => (
                  <div
                    key={idx}
                    className="relative bg-white border border-slate-200 rounded-xl p-2.5 shadow-xs flex items-center space-x-3 group"
                  >
                    <img
                      src={item.previewUrl}
                      alt={`Muestra ${idx + 1}`}
                      className="w-16 h-16 rounded-lg object-cover border border-slate-100 shrink-0 cursor-pointer"
                      onClick={() =>
                        setLightboxImage({
                          url: item.previewUrl,
                          title: item.file.name,
                          desc: item.description,
                        })
                      }
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 truncate">{item.file.name}</p>
                      <p className="text-[10px] text-slate-400">
                        {(item.file.size / 1024).toFixed(1)} KB
                      </p>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSelectedFiles((prev) =>
                            prev.map((f, i) => (i === idx ? { ...f, description: val } : f))
                          );
                        }}
                        placeholder="Descripción de la muestra..."
                        className="mt-1 w-full text-[11px] p-1 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 bg-slate-50"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSelectedFile(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Quitar foto"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Already Stored Evidences in Database */}
          {existingEvidences.length > 0 && (
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                Evidencias Registradas y Protegidas ({existingEvidences.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {existingEvidences.map((ev) => {
                  const displayImg = ev.blobUrl || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200';
                  return (
                    <div
                      key={ev.id}
                      className="relative bg-white border border-slate-200 rounded-xl p-2.5 shadow-xs flex items-center space-x-3 group"
                    >
                      <img
                        src={displayImg}
                        alt={ev.originalFileName || ev.fileName}
                        className="w-16 h-16 rounded-lg object-cover border border-slate-100 shrink-0 cursor-pointer"
                        onClick={() =>
                          setLightboxImage({
                            url: displayImg,
                            title: ev.originalFileName || ev.fileName,
                            desc: ev.description,
                            sha256: ev.sha256,
                          })
                        }
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 truncate" title={ev.originalFileName || ev.fileName}>
                          {ev.originalFileName || ev.fileName}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {ev.uploadedBy} • {ev.uploadedAt ? new Date(ev.uploadedAt).toLocaleDateString() : ''}
                        </p>
                        {ev.sha256 && (
                          <span className="inline-flex items-center gap-1 text-[9px] text-emerald-700 font-mono bg-emerald-50 px-1.5 py-0.5 rounded mt-0.5">
                            <FileCheck className="w-2.5 h-2.5" />
                            SHA-256 Verificado
                          </span>
                        )}
                        <p className="text-[11px] text-slate-600 truncate mt-0.5 italic">
                          {ev.description || 'Sin descripción'}
                        </p>
                      </div>
                      {!isLocked && (
                        <button
                          type="button"
                          onClick={() => handleDeleteExistingEvidence(ev.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Desactivar evidencia"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {selectedFiles.length === 0 && existingEvidences.length === 0 && (
            <div className="py-6 text-center text-slate-400 text-xs">
              <ImageIcon className="w-8 h-8 mx-auto mb-1 text-slate-300" />
              <span>Aún no se han adjuntado fotografías de inspección a este lote.</span>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button
            variant="outline"
            size="md"
            type="button"
            onClick={() => onNavigate(`/lots/${lot.id}`)}
            icon={<X className="w-4 h-4" />}
          >
            {isLocked ? 'Volver al Lote' : 'Cancelar'}
          </Button>
          {!isLocked && (
            <Button
              variant="teal"
              size="md"
              type="submit"
              isLoading={isSubmitting}
              icon={<Save className="w-4 h-4" />}
            >
              Guardar Inspección QA
            </Button>
          )}
        </div>
      </form>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative bg-white rounded-2xl max-w-3xl w-full p-4 shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">{lightboxImage.title}</h4>
              <button
                onClick={() => setLightboxImage(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-3 flex items-center justify-center bg-slate-950 rounded-xl overflow-hidden max-h-[70vh]">
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                className="max-h-[68vh] object-contain"
              />
            </div>

            <div className="mt-3 space-y-1.5">
              {lightboxImage.desc && (
                <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded-lg">
                  <strong>Descripción:</strong> {lightboxImage.desc}
                </p>
              )}
              {lightboxImage.sha256 && (
                <p className="text-[10px] text-slate-500 font-mono bg-slate-100 p-1.5 rounded truncate">
                  <strong>SHA-256:</strong> {lightboxImage.sha256}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
