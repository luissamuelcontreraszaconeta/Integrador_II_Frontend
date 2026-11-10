import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, ExternalLink } from 'lucide-react';
import { PUBLIC_APP_URL } from '../../services/apiConfig';

interface TraceabilityQRCodeProps {
  qrToken?: string;
  lotCode: string;
  size?: number;
  includeText?: boolean;
  className?: string;
}

export const TraceabilityQRCode: React.FC<TraceabilityQRCodeProps> = ({
  qrToken,
  lotCode,
  size = 160,
  includeText = true,
  className = '',
}) => {
  const publicBaseUrl = PUBLIC_APP_URL.replace(/\/+$/, '');
  const cleanToken = (qrToken || '').trim();
  const verificationPath = cleanToken ? `/verificar/${encodeURIComponent(cleanToken)}` : '';
  const verificationUrl = cleanToken ? `${publicBaseUrl}${verificationPath}` : '';

  if (!cleanToken) {
    return (
      <div className={`flex flex-col items-center justify-center text-center p-3 bg-slate-50 rounded-xl border border-slate-200 ${className}`}>
        <span className="text-[11px] text-slate-500 font-medium">
          Token QR pendiente de sincronización
        </span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      {/* Real Standard QR Code Container with white quiet zone and subtle border */}
      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs inline-block print:p-2 print:border-slate-400">
        <QRCodeSVG
          value={verificationUrl}
          size={size}
          level="H"
          fgColor="#0F172A"
          bgColor="#FFFFFF"
          includeMargin={true}
        />
      </div>

      {includeText ? (
        <div className="mt-2 space-y-1">
          <span className="text-xs font-mono font-bold text-slate-800 block">
            {lotCode}
          </span>
          <p className="text-[11px] text-slate-500 font-medium">
            Escanee para verificar autenticidad
          </p>
          <a
            href={verificationPath}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 hover:bg-blue-100 text-[10px] font-semibold text-[#0F6CBD] border border-blue-200 transition-colors no-print"
          >
            <ShieldCheck className="w-3 h-3" />
            <span>Verificación ExporTrace</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      ) : (
        <a
          href={verificationPath}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-[#0F6CBD] hover:underline no-print"
        >
          <span>Probar enlace QR</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      )}
    </div>
  );
};
