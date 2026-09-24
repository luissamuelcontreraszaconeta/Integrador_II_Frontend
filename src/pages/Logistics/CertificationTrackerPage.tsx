import React, { useState } from 'react';
import { useLots } from '../../context/LotContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { ExpedienteDigitalView } from '../../components/lots/ExpedienteDigitalView';
import { SanitaryCertificate } from '../../types/certification';
import { Award, CheckCircle2, FileText, Send, ShieldCheck, Clock } from 'lucide-react';

interface CertificationTrackerPageProps {
  onNavigate: (path: string) => void;
}

export const CertificationTrackerPage: React.FC<CertificationTrackerPageProps> = ({ onNavigate }) => {
  const { lots, initiateCertification, approveCertification, getCertificate } = useLots();
  
  const eligibleLots = lots.filter(
    (l) => l.status === 'READY_FOR_CERTIFICATION' || l.status === 'IN_CERTIFICATION' || l.status === 'CERTIFIED'
  );
  
  const [selectedLotId, setSelectedLotId] = useState<string>(eligibleLots[0]?.id || lots[0]?.id || '');
  const [cert, setCert] = useState<SanitaryCertificate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedLot = lots.find((l) => l.id === selectedLotId);

  React.useEffect(() => {
    if (selectedLot?.certificationId) {
      getCertificate(selectedLot.certificationId).then((c) => setCert(c));
    } else {
      setCert(null);
    }
  }, [selectedLot, getCertificate]);

  const handleInitiate = async () => {
    if (!selectedLot) return;
    setIsSubmitting(true);
    try {
      const newCert = await initiateCertification(selectedLot.id);
      setCert(newCert);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async () => {
    if (!cert) return;
    setIsSubmitting(true);
    try {
      const updated = await approveCertification(cert.id);
      setCert(updated);
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

      {/* Lot selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-96">
          <Award className="w-5 h-5 text-teal-400 shrink-0" />
          <Select
            label="Seleccionar Lote para Gestión Sanitaria"
            value={selectedLotId}
            onChange={(e) => setSelectedLotId(e.target.value)}
            options={lots.map((l) => ({
              value: l.id,
              label: `${l.code} - ${l.production.productName} (${l.status})`,
            }))}
          />
        </div>

        {selectedLot && !cert && (
          <Button
            variant="teal"
            size="md"
            onClick={handleInitiate}
            isLoading={isSubmitting}
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
      </div>

      {selectedLot && (
        <div className="space-y-6">
          {/* Prerequisites Checklist */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Checklist Previo a Solicitud de Certificado Sanitario
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs font-semibold">
              <div className="p-2.5 bg-emerald-950/40 border border-emerald-800 text-emerald-300 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Producción ✓
              </div>
              <div className="p-2.5 bg-emerald-950/40 border border-emerald-800 text-emerald-300 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> QA Conforme ✓
              </div>
              <div className="p-2.5 bg-emerald-950/40 border border-emerald-800 text-emerald-300 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Cadena Frío ✓
              </div>
              <div className="p-2.5 bg-emerald-950/40 border border-emerald-800 text-emerald-300 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Documentación ✓
              </div>
              <div className="p-2.5 bg-emerald-950/40 border border-emerald-800 text-emerald-300 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Validación ✓
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
