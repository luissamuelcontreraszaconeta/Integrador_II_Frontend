import React from 'react';
import { Lot } from '../../types/lot';
import { SanitaryCertificate } from '../../types/certification';
import { StatusBadge } from '../ui/StatusBadge';
import { Button } from '../ui/Button';
import { TraceabilityQRCode } from './TraceabilityQRCode';
import { Printer, Download, ShieldCheck } from 'lucide-react';

interface ExpedienteDigitalViewProps {
  lot: Lot;
  certificate?: SanitaryCertificate | null;
  onGeneratePdf?: () => void;
}

export const ExpedienteDigitalView: React.FC<ExpedienteDigitalViewProps> = ({
  lot,
  certificate,
  onGeneratePdf,
}) => {
  const [downloading, setDownloading] = React.useState(false);
  const [downloadSuccess, setDownloadSuccess] = React.useState(false);

  const handlePdfDownload = () => {
    setDownloading(true);
    if (onGeneratePdf) onGeneratePdf();
    setTimeout(() => {
      setDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
      window.print();
    }, 1000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm space-y-8 print:bg-white print:text-black print:p-0 print:border-none">
      {/* Header of Expediente */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-6 gap-4 print:border-black">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-[#0F6CBD] print:text-black" />
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 print:text-black">
              EXPEDIENTE DIGITAL DE TRAZABILIDAD
            </h2>
          </div>
          <p className="text-xs text-slate-500 print:text-slate-700">
            Dossier Sanitario Consolidado de Exportación Pesquera | ExporTrace Platform v2.6
          </p>
        </div>

        <div className="flex items-center gap-3 no-print">
          <Button
            variant="teal"
            size="md"
            onClick={handlePdfDownload}
            isLoading={downloading}
            icon={<Download className="w-4 h-4" />}
          >
            {downloadSuccess ? '¡PDF Generado!' : 'Generar PDF Expediente'}
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => window.print()}
            icon={<Printer className="w-4 h-4" />}
          >
            Imprimir Dossier
          </Button>
        </div>
      </div>

      {/* Primary Metadata & Real Scannable QR Code */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200 print:bg-slate-100 print:border-slate-300">
        <div className="md:col-span-3 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-[#0F6CBD] print:text-black">{lot.code}</span>
            <StatusBadge status={lot.status} size="lg" />
          </div>
          <p className="text-base font-bold text-slate-900 print:text-black">{lot.production.productName}</p>
          <p className="text-xs text-slate-500 print:text-slate-600">
            Especie Científica: <span className="italic font-semibold text-slate-700 print:text-black">{lot.production.scientificName}</span> | 
            Volumen: <span className="font-semibold text-slate-800 print:text-black">{lot.production.quantity} {lot.production.unit}</span>
          </p>
          <p className="text-xs text-slate-500 print:text-slate-600">
            Registrado por: <span className="text-slate-700 font-medium print:text-black">{lot.createdBy}</span> el {new Date(lot.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex flex-col items-center justify-center p-3 bg-white border border-slate-200 rounded-lg text-center shadow-xs print:bg-white print:border-slate-400">
          <TraceabilityQRCode
            qrToken={lot.qrToken}
            lotCode={lot.code}
            size={105}
            includeText={false}
          />
          <span className="text-[10px] font-mono text-slate-700 mt-1 print:text-black font-bold">
            {lot.code}
          </span>
          <span className="text-[9px] text-[#0F6CBD] print:text-black font-semibold">
            Verificación ExporTrace
          </span>
        </div>
      </div>

      {/* Section 1: Producción y Origen */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#0F6CBD] border-b border-slate-200 pb-1.5 print:text-black print:border-black">
          1. Información de Origen y Producción
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 print:bg-slate-50 print:border-slate-300">
            <span className="text-slate-500 font-medium block text-[10px] uppercase">Proveedor / Cofradía</span>
            <span className="text-slate-800 font-semibold print:text-black">{lot.production.supplier}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 print:bg-slate-50 print:border-slate-300">
            <span className="text-slate-500 font-medium block text-[10px] uppercase">Embarcación Pesquera</span>
            <span className="text-slate-800 font-semibold print:text-black">{lot.production.vesselName}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 print:bg-slate-50 print:border-slate-300">
            <span className="text-slate-500 font-medium block text-[10px] uppercase">Puerto de Origen</span>
            <span className="text-slate-800 font-semibold print:text-black">{lot.production.portOfOrigin}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 print:bg-slate-50 print:border-slate-300">
            <span className="text-slate-500 font-medium block text-[10px] uppercase">Procesamiento</span>
            <span className="text-slate-800 font-semibold print:text-black">{lot.production.processingType}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 print:bg-slate-50 print:border-slate-300">
            <span className="text-slate-500 font-medium block text-[10px] uppercase">Línea de Producción</span>
            <span className="text-slate-800 font-semibold print:text-black">{lot.production.productionLine}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 print:bg-slate-50 print:border-slate-300">
            <span className="text-slate-500 font-medium block text-[10px] uppercase">Supervisión</span>
            <span className="text-slate-800 font-semibold print:text-black">{lot.production.shiftSupervisor}</span>
          </div>
        </div>
      </div>

      {/* Section 2: Inspección Organoléptica QA */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#0F6CBD] border-b border-slate-200 pb-1.5 print:text-black print:border-black">
          2. Control de Calidad Organoléptico (QA)
        </h3>
        {lot.qa ? (
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-3 print:bg-slate-50 print:border-slate-300">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 print:text-black">
                Inspector Auditante: {lot.qa.inspectorName || 'María Elena Quispe'} ({new Date(lot.qa.inspectedAt || Date.now()).toLocaleDateString()})
              </span>
              <span
                className={`px-2.5 py-0.5 rounded font-bold ${
                  lot.qa.organolepticResult === 'CONFORME'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                Resultado: {lot.qa.organolepticResult}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 font-medium">
              <span className="p-2 bg-white rounded border border-slate-200 text-slate-700 print:bg-white print:border print:text-black">Apariencia: {lot.qa.appearance}</span>
              <span className="p-2 bg-white rounded border border-slate-200 text-slate-700 print:bg-white print:border print:text-black">Color: {lot.qa.color}</span>
              <span className="p-2 bg-white rounded border border-slate-200 text-slate-700 print:bg-white print:border print:text-black">Textura: {lot.qa.texture}</span>
              <span className="p-2 bg-white rounded border border-slate-200 text-slate-700 print:bg-white print:border print:text-black">Olor: {lot.qa.smell}</span>
              <span className="p-2 bg-white rounded border border-slate-200 text-slate-700 print:bg-white print:border print:text-black">Parásitos: {lot.qa.parasiteCheck}</span>
            </div>
            {lot.qa.observations && (
              <p className="text-slate-600 italic print:text-slate-700">Observaciones QA: {lot.qa.observations}</p>
            )}
          </div>
        ) : (
          <p className="text-xs text-amber-600 italic">Inspección organoléptica aún no registrada.</p>
        )}
      </div>

      {/* Section 3: Cadena de Frío */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#0F6CBD] border-b border-slate-200 pb-1.5 print:text-black print:border-black">
          3. Registro de Cadena de Frío (Manual QA Audit)
        </h3>
        {lot.coldChainLogs.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-slate-200 print:border-slate-300">
            <table className="w-full text-xs text-left text-slate-700 print:text-black">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 print:bg-slate-200 print:text-black">
                <tr>
                  <th className="p-2.5">Fecha / Hora</th>
                  <th className="p-2.5">Temperatura (°C)</th>
                  <th className="p-2.5">Ubicación / Cámara</th>
                  <th className="p-2.5">Responsable</th>
                  <th className="p-2.5">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 print:divide-slate-300">
                {lot.coldChainLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="p-2.5">{new Date(log.recordedAt).toLocaleDateString()} {log.time}</td>
                    <td className="p-2.5 font-bold font-mono text-[#0F6CBD] print:text-black">{log.temperature}°C</td>
                    <td className="p-2.5">{log.location}</td>
                    <td className="p-2.5">{log.responsible}</td>
                    <td className="p-2.5 font-bold">
                      <span className={log.status === 'NORMAL' ? 'text-emerald-600' : 'text-rose-600'}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-amber-600 italic">Sin registros de temperatura en cámara fría.</p>
        )}
      </div>

      {/* Section 4: Certificación SANIPES */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#0F6CBD] border-b border-slate-200 pb-1.5 print:text-black print:border-black">
          4. Estado de Certificación Sanitaria Oficial SANIPES
        </h3>
        {certificate ? (
          <div className="p-4 bg-teal-50/50 border border-teal-200 rounded-lg text-xs space-y-2 print:bg-slate-50 print:border-slate-300">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 print:text-black">N° Expediente: {certificate.sanipesDossierNumber}</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                Estado: {certificate.status}
              </span>
            </div>
            {certificate.certificateNumber && (
              <p className="text-emerald-700 font-bold print:text-black">
                N° Certificado Oficial: {certificate.certificateNumber} (Emitido: {certificate.issuedDate})
              </p>
            )}
            <p className="text-slate-600 print:text-slate-700">Oficina Evaluadora: {certificate.evaluationOffice}</p>
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">Trámite de certificación no iniciado.</p>
        )}
      </div>

      {/* Dossier Footer */}
      <div className="pt-6 border-t border-slate-200 text-center text-xs text-slate-500 space-y-1 print:border-black print:text-slate-700">
        <p className="font-semibold text-slate-700">ExporTrace Enterprise Sanitary Traceability Platform</p>
        <p>Documento de trazabilidad consolidado emitido de conformidad con la Ley Sanitaria Pesquera.</p>
      </div>
    </div>
  );
};
