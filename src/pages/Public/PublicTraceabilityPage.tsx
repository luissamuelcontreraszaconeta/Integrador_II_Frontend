import React, { useState, useEffect, useCallback } from 'react';
import { PublicTraceabilityData } from '../../types/publicTraceability';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Anchor,
  Thermometer,
  FileText,
  Award,
  RefreshCw,
  Copy,
  Check,
  Truck,
  Calendar,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { API_BASE_URL } from '../../services/apiConfig';

interface PublicTraceabilityPageProps {
  token: string;
  onNavigate?: (path: string) => void;
}

export const PublicTraceabilityPage: React.FC<PublicTraceabilityPageProps> = ({ token, onNavigate }) => {
  const [data, setData] = useState<PublicTraceabilityData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const cleanToken = (token || '').trim();

  const fetchTraceabilityData = useCallback(async () => {
    if (!cleanToken) {
      setData(null);
      setError('NOT_FOUND');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/public/traceability/verify/${encodeURIComponent(cleanToken)}`,
        {
          method: 'GET',
          headers: { Accept: 'application/json' },
        }
      );

      if (response.ok) {
        const json: PublicTraceabilityData = await response.json();
        if (json && json.valid) {
          setData(json);
          setLoading(false);
          return;
        }
      }

      setData(null);
      setError('NOT_FOUND');
    } catch {
      setData(null);
      setError('NOT_FOUND');
    } finally {
      setLoading(false);
    }
  }, [cleanToken]);

  useEffect(() => {
    fetchTraceabilityData();
  }, [fetchTraceabilityData]);

  const copyCurrentUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col justify-between">
      {/* Top Corporate Public Brand Header (Mobile-first 390px compatible) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#123B5D] to-[#0F9D8A] flex items-center justify-center text-white shadow-sm shrink-0">
              <Anchor className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-black tracking-tight text-base sm:text-lg text-[#123B5D]">
                  EXPORTRACE
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[10px] font-bold text-[#0F6CBD] border border-blue-200">
                  VERIFICACIÓN PÚBLICA
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block truncate">
                Plataforma de Trazabilidad y Certificación Sanitaria Hidrobiológica
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={copyCurrentUrl}
              icon={copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            >
              <span className="hidden xs:inline">{copied ? '¡Copiada!' : 'Copiar URL'}</span>
            </Button>
            {onNavigate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('/dashboard')}
              >
                Acceso Interno
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full space-y-6">
        {/* Title & Status Summary Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-[#0F9D8A]" />
            <span>Consulta Oficial de Trazabilidad Sanitaria</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Verificación de trazabilidad
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Resultado oficial en tiempo real de autenticidad e inocuidad sanitaria del lote hidrobiológico.
          </p>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 sm:p-12 text-center shadow-sm space-y-4">
            <div className="w-12 h-12 border-4 border-[#0F6CBD]/20 border-t-[#0F6CBD] rounded-full animate-spin mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">Verificando código QR...</h3>
              <p className="text-xs text-slate-500">
                Consultando el registro oficial de trazabilidad en ExporTrace.
              </p>
            </div>
          </div>
        )}

        {/* INVALID OR NOT FOUND TOKEN STATE (Controlled UI, no raw 404 screen) */}
        {!loading && (error || !data || !data.valid) && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-12 text-center shadow-sm space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto">
              <XCircle className="w-9 h-9" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                No se encontró un registro válido para este código.
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                El código consultado{' '}
                {cleanToken && (
                  <span className="font-mono font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded break-all">
                    {cleanToken}
                  </span>
                )}{' '}
                no corresponde a un lote activo o verificable en los registros oficiales de ExporTrace.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={fetchTraceabilityData}
                icon={<RefreshCw className="w-4 h-4" />}
              >
                Reintentar verificación
              </Button>
            </div>
          </div>
        )}

        {/* VALID VERIFIED LOT DISPLAY */}
        {!loading && data && data.valid && (
          <div className="space-y-6">
            {/* Authenticity Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-extrabold text-emerald-900">
                    ✓ Registro auténtico en ExporTrace
                  </p>
                  <p className="text-xs text-emerald-700">
                    Estado sanitario: <strong>{data.estadoSanitario || data.estadoGeneral}</strong>
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-white/80 px-3 py-1.5 rounded-lg border border-emerald-200 self-start sm:self-center">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>Fecha lote: {data.fechaRelevante || data.fechaProduccion}</span>
              </div>
            </div>

            {/* Primary Verification Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Código de Lote
                  </span>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-2xl sm:text-3xl font-black text-[#0F6CBD] tracking-tight">
                      {data.lotCode || data.codigo}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[#0F6CBD] text-xs font-bold">
                      {data.estadoGeneral}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 pt-1">
                    {data.producto}
                  </h2>
                  <p className="text-xs text-slate-500 italic">
                    Especie: <span className="font-semibold text-slate-700">{data.especie}</span>
                  </p>
                </div>

                <div className="text-left sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-0 border-slate-200">
                  <span className="text-xs text-slate-400 block font-medium">Volumen Neto Certificado</span>
                  <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                    {data.volumen} {data.unidad}
                  </span>
                </div>
              </div>

              {/* 4 Core Traceability Stages: QA, Cadena de Frío, Certificación, Despacho */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-xl border bg-slate-50 border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Estado QA</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-sm font-bold text-emerald-700 block">
                    {data.estadoCalidad}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Inspección organoléptica sanitaria
                  </span>
                </div>

                <div className="p-4 rounded-xl border bg-slate-50 border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Cadena de Frío</span>
                    <Thermometer className="w-4 h-4 text-[#0F6CBD]" />
                  </div>
                  <span className="text-sm font-bold text-emerald-700 block">
                    {data.estadoCadenaFrio === 'ALERTA_TERMICA' ? 'OBSERVADA' : 'CONFORME (≤ -18°C)'}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    {data.resumenCadenaFrio || 'Custodia térmica verificada'}
                  </span>
                </div>

                <div className="p-4 rounded-xl border bg-slate-50 border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Certificación SANIPES</span>
                    <Award className="w-4 h-4 text-[#0F6CBD]" />
                  </div>
                  <span className="text-sm font-bold text-[#0F6CBD] block">
                    {data.estadoCertificacion}
                  </span>
                  <span
                    className="text-[11px] text-slate-500 block truncate"
                    title={data.numeroCertificadoSanitario || 'Expediente sanitario validado'}
                  >
                    {data.numeroCertificadoSanitario || 'Expediente sanitario validado'}
                  </span>
                </div>

                <div className="p-4 rounded-xl border bg-slate-50 border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Estado de Despacho</span>
                    <Truck className="w-4 h-4 text-[#0F9D8A]" />
                  </div>
                  <span className="text-sm font-bold text-slate-800 block">
                    {data.estadoDespacho || 'AUTORIZADO PARA DESPACHO'}
                  </span>
                  <span className="text-[11px] text-slate-500 block truncate">
                    {data.puertoDestino || (data.documentacionCompleta ? 'Expediente documental completo' : 'En gestión logística')}
                  </span>
                </div>
              </div>

              {/* Public Origin & Processing Summary */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Datos Públicos de Origen y Planta
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block font-medium">Planta de Procesamiento</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">{data.plantaProcesamiento}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block font-medium">Embarcación / Origen</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">{data.embarcacion}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block font-medium">Puerto de Desembarque</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">{data.puertoOrigen}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block font-medium">Proveedor Registrado</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">{data.proveedor}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block font-medium">Expediente Documental</span>
                    <span className="font-semibold text-emerald-700 mt-0.5 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      {data.documentacionCompleta ? 'Completo y verificado' : 'En proceso'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block font-medium">Identificador de Verificación</span>
                    <span
                      className="font-mono text-[10px] text-slate-600 truncate mt-0.5 block"
                      title={data.qrToken}
                    >
                      {data.qrToken}
                    </span>
                  </div>
                </div>
              </div>

              {/* Traceability Seal Notice */}
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 flex items-start gap-3 text-xs text-slate-700">
                <ShieldCheck className="w-5 h-5 text-[#0F6CBD] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">
                    ✓ Registro auténtico en ExporTrace
                  </p>
                  <p className="text-slate-600 mt-0.5">
                    Esta consulta pública es de solo lectura y muestra únicamente indicadores sanitarios y de trazabilidad autorizados para verificación externa.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Corporate Public Footer */}
      <footer className="bg-white border-t border-slate-200 py-5 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-700">ExporTrace Enterprise Sanitary Traceability Platform</p>
          <p>Verificación pública de trazabilidad hidrobiológica y certificación sanitaria.</p>
        </div>
      </footer>
    </div>
  );
};
