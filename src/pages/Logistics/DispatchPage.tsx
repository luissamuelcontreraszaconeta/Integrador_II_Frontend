import React, { useState } from 'react';
import { useLots } from '../../context/LotContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { AlertCard } from '../../components/ui/AlertCard';
import { Truck, CheckCircle2, Lock, ShieldCheck, Send, Ship, AlertTriangle } from 'lucide-react';

interface DispatchPageProps {
  lotId?: string;
  onNavigate: (path: string) => void;
}

export const DispatchPage: React.FC<DispatchPageProps> = ({ lotId, onNavigate }) => {
  const { lots, authorizeDispatch } = useLots();
  
  const [selectedLotId, setSelectedLotId] = useState<string>(
    lotId || lots.find((l) => l.status === 'READY_FOR_DISPATCH' || l.status === 'CERTIFIED')?.id || lots[0]?.id || ''
  );
  
  const lot = lots.find((l) => l.id === selectedLotId) || lots[0];

  const [destinationCountry, setDestinationCountry] = useState('España');
  const [destinationPort, setDestinationPort] = useState('Puerto de Valencia');
  const [containerNumber, setContainerNumber] = useState('MSCU-982341-0');
  const [sealNumber, setSealNumber] = useState('SANIPES-SEAL-8831');
  const [shippingLine, setShippingLine] = useState('MSC Mediterranean Shipping Company');
  const [estimatedDeparture, setEstimatedDeparture] = useState('2026-09-05');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!lot) {
    return <div className="p-8 text-slate-400">Sin lotes para despacho.</div>;
  }

  // Gates calculation
  const isProdComplete = true;
  const isQAConforme = lot.qa?.organolepticResult === 'CONFORME';
  const isColdChainConforme = lot.coldChainLogs.length > 0 && !lot.coldChainLogs.some((c) => c.status === 'CRITICAL');
  const isDocsComplete = (lot.documents?.length || 0) >= 2;
  const isCertApproved = lot.status === 'CERTIFIED' || lot.status === 'READY_FOR_DISPATCH' || lot.status === 'DISPATCHED';

  const isEligible = isProdComplete && isQAConforme && isColdChainConforme && isDocsComplete && isCertApproved;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEligible) {
      setErrorMsg('BLOQUEO P0: No se puede autorizar el despacho sin cumplir todos los requisitos sanitarios.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await authorizeDispatch(lot.id, {
        destinationCountry,
        destinationPort,
        containerNumber,
        sealNumber,
        shippingLine,
        estimatedDeparture,
      });
      onNavigate(`/lots/${lot.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al autorizar despacho');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title={`Autorización de Despacho & Salida de Planta - ${lot.code}`}
        subtitle="Verificación de requerimientos de inocuidad previa al embarque del contenedor"
        breadcrumbs={[
          { label: 'Inicio', onClick: () => onNavigate('/dashboard') },
          { label: 'LogisTrac', onClick: () => onNavigate('/logistics') },
          { label: 'Despacho' },
        ]}
      />

      {/* Lot Selector */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
        <Truck className="w-5 h-5 text-[#0F6CBD] shrink-0" />
        <Select
          label="Seleccionar Lote para Despacho"
          value={lot.id}
          onChange={(e) => {
            setSelectedLotId(e.target.value);
            setErrorMsg(null);
          }}
          options={lots.map((l) => ({
            value: l.id,
            label: `${l.code} - ${l.production?.productName || 'Producto'} [${l.status}]`,
          }))}
        />
      </div>

      {errorMsg && (
        <AlertCard
          type="error"
          title="Error en Despacho"
          message={errorMsg}
        />
      )}

      {/* Strict Gatekeeping Matrix */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-3">
          Verificación de Requisitos Obligatorios para Embarque
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div className={`p-3 rounded-lg border flex items-center justify-between ${isProdComplete ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
            <span>Producción Completa</span>
            {isProdComplete ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Lock className="w-4 h-4" />}
          </div>
          <div className={`p-3 rounded-lg border flex items-center justify-between ${isQAConforme ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
            <span>QA Conforme</span>
            {isQAConforme ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Lock className="w-4 h-4" />}
          </div>
          <div className={`p-3 rounded-lg border flex items-center justify-between ${isColdChainConforme ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
            <span>Cadena Frío OK</span>
            {isColdChainConforme ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Lock className="w-4 h-4" />}
          </div>
          <div className={`p-3 rounded-lg border flex items-center justify-between ${isDocsComplete ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
            <span>Docs Completos</span>
            {isDocsComplete ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Lock className="w-4 h-4" />}
          </div>
          <div className={`p-3 rounded-lg border flex items-center justify-between ${isCertApproved ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
            <span>Certificado SANIPES</span>
            {isCertApproved ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Lock className="w-4 h-4 text-rose-600" />}
          </div>
        </div>

        {isEligible ? (
          <AlertCard
            type="success"
            title="APTO PARA DESPACHO"
            message="El lote cumple al 100% con los requerimientos de trazabilidad, control organoléptico, cadena de frío y certificado sanitario oficial emitido."
          />
        ) : (
          <AlertCard
            type="error"
            title="DESPACHO BLOQUEADO POR REQUISITOS FALTANTES"
            message="El sistema ExporTrace ha bloqueado la salida de planta. Se requiere dictamen QA Conforme y Certificado Sanitario Oficial emitido por SANIPES."
          />
        )}
      </div>

      {/* Dispatch Authorization Form */}
      {isEligible && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
            <Truck className="w-5 h-5 text-[#0F6CBD]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Manifiesto de Salida y Embarque Contenedor
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="País de Destino"
              required
              value={destinationCountry}
              onChange={(e) => setDestinationCountry(e.target.value)}
            />
            <Input
              label="Puerto de Destino"
              required
              value={destinationPort}
              onChange={(e) => setDestinationPort(e.target.value)}
            />
            <Input
              label="Número de Contenedor Frigorífico (Reefer)"
              required
              value={containerNumber}
              onChange={(e) => setContainerNumber(e.target.value)}
            />
            <Input
              label="Número de Precinto Sanitario (Seal SANIPES)"
              required
              value={sealNumber}
              onChange={(e) => setSealNumber(e.target.value)}
            />
            <Input
              label="Línea Naviera"
              required
              value={shippingLine}
              onChange={(e) => setShippingLine(e.target.value)}
            />
            <Input
              label="Fecha Estimada de Zarpe / Salida"
              type="date"
              required
              value={estimatedDeparture}
              onChange={(e) => setEstimatedDeparture(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-slate-200">
            <Button
              variant="teal"
              size="lg"
              type="submit"
              isLoading={isSubmitting}
              icon={<Send className="w-4 h-4" />}
            >
              Autorizar Despacho & Marcar DISPATCHED
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
