import React, { useState } from 'react';
import { useLots } from '../../context/LotContext';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { LotTimeline } from '../../components/lots/LotTimeline';
import { ValidationChecklist } from '../../components/lots/ValidationChecklist';
import { ColdChainGraph } from '../../components/lots/ColdChainGraph';
import { QRCodeModal } from '../../components/lots/QRCodeModal';
import { ExpedienteDigitalView } from '../../components/lots/ExpedienteDigitalView';
import { SanitaryCertificate } from '../../types/certification';
import { 
  QrCode, 
  ShieldCheck, 
  FileText, 
  Thermometer, 
  Award, 
  Truck, 
  CheckCircle2, 
  AlertTriangle, 
  History, 
  Download, 
  Plus, 
  Send 
} from 'lucide-react';

interface LotDetailPageProps {
  lotId: string;
  onNavigate: (path: string) => void;
}

export const LotDetailPage: React.FC<LotDetailPageProps> = ({ lotId, onNavigate }) => {
  const { getLotById, runValidation, addColdChainLog, getCertificate, initiateCertification } = useLots();
  const { currentRole } = useAuth();
  
  const lot = getLotById(lotId);
  const [activeTab, setActiveTab] = useState<
    'RESUMEN' | 'PRODUCCION' | 'CALIDAD' | 'COLD_CHAIN' | 'DOCUMENTOS' | 'CERTIFICACION' | 'HISTORIAL'
  >('RESUMEN');

  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [certificate, setCertificate] = useState<SanitaryCertificate | null>(null);

  // Temperature entry form state
  const [tempVal, setTempVal] = useState<number>(-20.5);
  const [tempLoc, setTempLoc] = useState('Cámara N° 01 - Paita');

  React.useEffect(() => {
    if (lot?.certificationId) {
      getCertificate(lot.certificationId).then((cert) => setCertificate(cert));
    }
  }, [lot, getCertificate]);

  if (!lot) {
    return (
      <div className="p-12 text-center text-slate-400 bg-slate-900 rounded-xl border border-slate-800">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-200">Lote no encontrado</h3>
        <p className="text-xs text-slate-400 mt-1">El lote especificado ({lotId}) no existe o fue eliminado.</p>
        <Button variant="teal" size="sm" onClick={() => onNavigate('/lots')} className="mt-4">
          Volver a la lista de lotes
        </Button>
      </div>
    );
  }

  const handleRunValidation = async () => {
    setIsValidating(true);
    try {
      await runValidation(lot.id);
    } finally {
      setIsValidating(false);
    }
  };

  const handleAddTempLog = async (e: React.FormEvent) => {
    e.preventDefault();
    await addColdChainLog(lot.id, Number(tempVal), tempLoc);
  };

  const handleStartCert = async () => {
    const cert = await initiateCertification(lot.id);
    setCertificate(cert);
    onNavigate(`/certification`);
  };

  const tabs = [
    { id: 'RESUMEN', label: 'Resumen & Validación', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'PRODUCCION', label: 'Producción', icon: <FileText className="w-4 h-4" /> },
    { id: 'CALIDAD', label: 'Control QA', icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: 'COLD_CHAIN', label: 'Cadena de Frío', icon: <Thermometer className="w-4 h-4" /> },
    { id: 'DOCUMENTOS', label: 'Documentos', icon: <FileText className="w-4 h-4" /> },
    { id: 'CERTIFICACION', label: 'Certificación SANIPES', icon: <Award className="w-4 h-4" /> },
    { id: 'HISTORIAL', label: 'Historial Audit', icon: <History className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header Command Bar */}
      <PageHeader
        title={`Lote Digital: ${lot.code}`}
        subtitle={`${lot.production.productName} (${lot.production.quantity} ${lot.production.unit})`}
        breadcrumbs={[
          { label: 'Inicio', onClick: () => onNavigate('/dashboard') },
          { label: 'Lotes', onClick: () => onNavigate('/lots') },
          { label: lot.code },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <StatusBadge status={lot.status} size="lg" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQrModalOpen(true)}
              icon={<QrCode className="w-4 h-4 text-teal-400" />}
            >
              Código QR
            </Button>
          </div>
        }
      />

      {/* 6-step interactive Timeline */}
      <LotTimeline timeline={lot.timeline} />

      {/* Tabs navigation */}
      <div className="border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-teal-500 text-teal-300 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: 1. RESUMEN */}
      {activeTab === 'RESUMEN' && (
        <div className="space-y-6">
          {/* Summary Scorecard Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100 border-b border-slate-800 pb-3">
              Estado Integral por Áreas de Responsabilidad
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Producción</span>
                <span className="text-xs font-bold text-emerald-400 mt-1 block">COMPLETO</span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Calidad QA</span>
                <span className={`text-xs font-bold mt-1 block ${lot.qa?.organolepticResult === 'CONFORME' ? 'text-emerald-400' : lot.qa ? 'text-rose-400' : 'text-amber-400'}`}>
                  {lot.qa ? lot.qa.organolepticResult : 'PENDIENTE'}
                </span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Cadena Frío</span>
                <span className={`text-xs font-bold mt-1 block ${lot.coldChainLogs.length > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {lot.coldChainLogs.length > 0 ? `${lot.coldChainLogs.length} LECTURAS` : 'PENDIENTE'}
                </span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Documentación</span>
                <span className="text-xs font-bold text-emerald-400 mt-1 block">
                  {lot.documents.length >= 2 ? 'COMPLETA' : 'INCOMPLETA'}
                </span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Validación</span>
                <span className={`text-xs font-bold mt-1 block ${lot.validation?.isValidated ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {lot.validation?.isValidated ? 'APROBADO' : 'PENDIENTE'}
                </span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Certificación</span>
                <span className="text-xs font-bold text-sky-400 mt-1 block">
                  {certificate ? certificate.status : 'NO INICIADA'}
                </span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Despacho</span>
                <span className={`text-xs font-bold mt-1 block ${lot.status === 'READY_FOR_DISPATCH' || lot.status === 'DISPATCHED' ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {lot.status === 'DISPATCHED' ? 'DESPACHADO' : lot.status === 'READY_FOR_DISPATCH' ? 'APTO' : 'BLOQUEADO'}
                </span>
              </div>
            </div>
          </div>

          {/* Smart Validation Component */}
          <ValidationChecklist
            lot={lot}
            onRunValidation={handleRunValidation}
            onSendToLogistics={() => onNavigate('/logistics')}
            onNotifyResponsible={() => alert(`Notificación de alerta enviada al área responsable del lote ${lot.code}.`)}
            isSubmitting={isValidating}
          />
        </div>
      )}

      {/* TAB CONTENT: 2. PRODUCCION */}
      {activeTab === 'PRODUCCION' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100 border-b border-slate-800 pb-3">
            Ficha Técnica de Origen y Producción
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold block">Producto</span>
              <span className="font-semibold text-slate-100">{lot.production.productName}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold block">Especie Científica</span>
              <span className="font-semibold text-teal-300 italic">{lot.production.scientificName}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold block">Volumen / Medida</span>
              <span className="font-semibold text-slate-100 font-mono">{lot.production.quantity} {lot.production.unit}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold block">Proveedor Pesquero</span>
              <span className="font-semibold text-slate-200">{lot.production.supplier}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold block">Embarcación</span>
              <span className="font-semibold text-slate-200">{lot.production.vesselName}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold block">Puerto de Recepción</span>
              <span className="font-semibold text-slate-200">{lot.production.portOfOrigin}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 3. CALIDAD QA */}
      {activeTab === 'CALIDAD' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
              Inspección Organoléptica QA
            </h3>
            {(currentRole === 'ADMINISTRADOR' || currentRole === 'QA') && (
              <Button
                variant="teal"
                size="sm"
                onClick={() => onNavigate(`/quality/inspect/${lot.id}`)}
                icon={<Plus className="w-4 h-4" />}
              >
                + Registrar Inspección QA
              </Button>
            )}
          </div>

          {lot.qa ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block font-semibold">Apariencia</span>
                  <span className="text-slate-100 font-bold text-sm mt-0.5 block">{lot.qa.appearance}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block font-semibold">Coloración</span>
                  <span className="text-slate-100 font-bold text-sm mt-0.5 block">{lot.qa.color}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block font-semibold">Textura Muscular</span>
                  <span className="text-slate-100 font-bold text-sm mt-0.5 block">{lot.qa.texture}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block font-semibold">Ausencia de Parásitos</span>
                  <span className="text-emerald-400 font-bold text-sm mt-0.5 block">{lot.qa.parasiteCheck}</span>
                </div>
              </div>

              {lot.qa.evidenceUrls && lot.qa.evidenceUrls.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-300">Evidencias Fotográficas Adjuntas:</span>
                  <div className="flex items-center gap-3">
                    {lot.qa.evidenceUrls.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt="QA Evidence"
                        className="w-28 h-20 object-cover rounded-lg border border-slate-700 shadow-md"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-amber-400 italic">Inspección organoléptica aún no realizada.</p>
          )}
        </div>
      )}

      {/* TAB CONTENT: 4. CADENA DE FRIO */}
      {activeTab === 'COLD_CHAIN' && (
        <div className="space-y-6">
          <ColdChainGraph logs={lot.coldChainLogs} />

          {/* Manual Temperature Entry Form */}
          {(currentRole === 'ADMINISTRADOR' || currentRole === 'QA') && (
            <form onSubmit={handleAddTempLog} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400">
                + Registro Manual de Temperatura (°C)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Temperatura °C (Target ≤ -18°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
                    value={tempVal}
                    onChange={(e) => setTempVal(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Ubicación / Cámara</label>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
                    value={tempLoc}
                    onChange={(e) => setTempLoc(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button variant="teal" size="md" type="submit" icon={<Send className="w-4 h-4" />}>
                    Guardar Lectura
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      {/* TAB CONTENT: 5. DOCUMENTOS */}
      {activeTab === 'DOCUMENTOS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100 border-b border-slate-800 pb-3">
            Expediente Documental del Lote
          </h3>
          <div className="divide-y divide-slate-800">
            {lot.documents.map((doc) => (
              <div key={doc.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-teal-400" />
                  <div>
                    <span className="font-semibold text-slate-200 block">{doc.name}</span>
                    <span className="text-[10px] text-slate-500">
                      Subido por {doc.uploadedBy} el {new Date(doc.uploadedAt).toLocaleDateString()} ({doc.size})
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" icon={<Download className="w-3.5 h-3.5" />}>
                  Descargar
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 6. CERTIFICACION */}
      {activeTab === 'CERTIFICACION' && (
        <div className="space-y-6">
          <ExpedienteDigitalView lot={lot} certificate={certificate} />
          {!certificate && (currentRole === 'ADMINISTRADOR' || currentRole === 'LOGISTICA') && (
            <div className="text-center p-6 bg-slate-900 border border-slate-800 rounded-xl">
              <Button variant="teal" size="lg" onClick={handleStartCert} icon={<Award className="w-5 h-5" />}>
                Iniciar Trámite de Certificación SANIPES
              </Button>
            </div>
          )}
        </div>
      )}

      {/* QR Code Modal Popup */}
      <QRCodeModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        lotCode={lot.code}
        productName={lot.production.productName}
      />
    </div>
  );
};
