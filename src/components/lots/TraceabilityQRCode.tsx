import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck } from 'lucide-react';
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
  // Use centralized PUBLIC_APP_URL
  const publicBaseUrl = PUBLIC_APP_URL;

  // Token fallback if not present
  const effectiveToken = qrToken || `QR-${lotCode.replace(/[^a-zA-Z0-9]/g, '')}`;
  const verificationUrl = `${publicBaseUrl.replace(/\/$/, '')}/verificar/${effectiveToken}`;

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

      {includeText && (
        <div className="mt-2 space-y-1">
          <span className="text-xs font-mono font-bold text-slate-800 block">
            {lotCode}
          </span>
          <p className="text-[11px] text-slate-500 font-medium">
            Escanee para verificar
          </p>
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-[10px] font-semibold text-[#0F6CBD] border border-blue-200">
            <ShieldCheck className="w-3 h-3" />
            <span>Verificación ExporTrace</span>
          </div>
        </div>
      )}
    </div>
  );
};
