import React, { useState } from 'react';
import { useLots } from '../../context/LotContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { ExpedienteDigitalView } from '../../components/lots/ExpedienteDigitalView';
import { SanitaryCertificate } from '../../types/certification';
import { Award, CheckCircle2, FileText, Send, ShieldCheck, Clock, Truck, AlertTriangle } from 'lucide-react';
import { AlertCard } from '../../components/ui/AlertCard';

interface CertificationTrackerPageProps {
  onNavigate: (path: string) => void;
}

export const CertificationTrackerPage: React.FC<CertificationTrackerPageProps> = ({ onNavigate }) => {
  const { lots, initiateCertification, approveCertification, getCertificate } = useLots();
  
  const eligibleLots = lots.filter(
    (l) => l.status === 'READY_FOR_CERTIFICATION' || l.status === 'IN_CERTIFICATION' || l.status === 'CERTIFIED' || l.status === 'READY_FOR_DISPATCH'
  );
  
  const [selectedLotId, setSelectedLotId] = useState<string>(eligibleLots[0]?.id || lots[0]?.id || '');
  const [cert, setCert] = useState<SanitaryCertificate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const selectedLot = lots.find((l) => l.id === selectedLotId);

  React.useEffect(() => {
    if (selectedLot?.certificationId) {
      getCertificate(selectedLot.certificationId).then((c) => setCert(c));
    } else {
      setCert(null);
    }
  }, [selectedLot, getCertificate]);

  const isQAConforme = selectedLot?.qa?.organolepticResult === 'CONFORME';
  const isCertified = selectedLot?.status === 'CERTIFIED' || selectedLot?.status === 'READY_FOR_DISPATCH' || cert?.status === 'APPROVED';

  const handleInitiate = async () => {
    if (!selectedLot) return;
    if (!isQAConforme) {
      setFeedbackMsg({
        type: 'error',
        text: 'BLOQUEO P0: No se puede iniciar trámite ante SANIPES. El lote no cuenta con dictamen QA CONFORME.',
      });
      return;
    }
    setIsSubmitting(true);
    setFeedbackMsg(null);
    try {
      const newCert = await initiateCertification(selectedLot.id);
      setCert(newCert);
      setFeedbackMsg({
        type: 'success',
        text: 'Expediente digital enviado formalmente a trámite ante SANIPES.',
      });
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err.message || 'Error al iniciar trámite de certificación.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async () => {
    if (!cert) return;
    setIsSubmitting(true);
    setFeedbackMsg(null);
    try {
      const updated = await approveCertification(cert.id);
      setCert(updated);
      setFeedbackMsg({
        type: 'success',
        text: `Certificado Sanitario Oficial ${updated.certificateNumber} APROBADO exitosamente.`,
      });
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err.message || 'Error al aprobar certificado sanitario.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión y Seguimiento de Certificación Sanitaria SANIPES"
        subtitle="Generación de expediente digital consolidado y trámite ante autoridad sanitaria"
        breadcrumbs={[
          { label: 'Inicio', onClick: () => onNavigate('/dashboard') },
          { label: 'LogisTrac', onClick: () => onNavigate('/logistics') },
          { label: 'Certificación' },
        ]}
      />

      {feedbackMsg && (
        <AlertCard
          type={feedbackMsg.type}
          title={feedbackMsg.type === 'error' ? 'Validación Requerida' : 'Operación Exitosa'}
          message={feedbackMsg.text}
        />
      )}

      {/* Lot selector & actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-96">
          <Award className="w-5 h-5 text-[#0F6CBD] shrink-0" />
          <Select
            label="Seleccionar Lote para Gestión Sanitaria"
            value={selectedLotId}
            onChange={(e) => {
              setSelectedLotId(e.target.value);
              setFeedbackMsg(null);
            }}
            options={lots.map((l) => ({
              value: l.id,
              label: `${l.code} - ${l.production?.productName || 'Producto'} (${l.status})`,
            }))}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {selectedLot && !cert && (
            <Button
              variant="teal"
              size="md"
              onClick={handleInitiate}
              isLoading={isSubmitting}
              disabled={!isQAConforme}
              icon={<Send className="w-4 h-4" />}
            >
              Registrar Solicitud SANIPES
            </Button>
          )}

          {cert && cert.status === 'IN_EVALUATION' && (
            <Button
              variant="teal"
              size="md"
              onClick={handleApprove}
              isLoading={isSubmitting}
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              Simular Aprobación SANIPES
            </Button>
          )}

          {/* BR-P0-004: Direct Proceed to Dispatch Button */}
          {isCertified && (
            <Button
              variant="primary"
              size="md"
              onClick={() => onNavigate('/dispatch')}
              icon={<Truck className="w-4 h-4" />}
            >
              Proceder a Despacho Logístico
            </Button>
          )}
        </div>
      </div>

      {selectedLot && (
        <div className="space-y-6">
          {/* Prerequisites Checklist */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Checklist Previo a Solicitud de Certificado Sanitario
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs font-semibold">
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Producción ✓
              </div>
              <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${isQAConforme ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                {isQAConforme ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
                <span>QA Conforme {isQAConforme ? '✓' : '(Falta)'}</span>
              </div>
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Cadena Frío ✓
              </div>
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Documentación ✓
              </div>
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Validación ✓
              </div>
            </div>
          </div>

          {/* Expediente Digital Printable View */}
          <ExpedienteDigitalView lot={selectedLot} certificate={cert} />
        </div>
      )}
    </div>
  );
};
