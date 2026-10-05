import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { TraceabilityQRCode } from './TraceabilityQRCode';
import { QrCode, Copy, Check, ExternalLink } from 'lucide-react';
import { PUBLIC_APP_URL } from '../../services/apiConfig';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  lotCode: string;
  productName: string;
  qrToken?: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  lotCode,
  productName,
  qrToken,
}) => {
  const [copied, setCopied] = useState(false);

  const publicBaseUrl = PUBLIC_APP_URL;

  const effectiveToken = qrToken || `QR-${lotCode.replace(/[^a-zA-Z0-9]/g, '')}`;
  const verificationUrl = `${publicBaseUrl.replace(/\/$/, '')}/verificar/${effectiveToken}`;

  const copyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Código QR de Trazabilidad - ${lotCode}`}
      subtitle="Escanee con cualquier cámara de smartphone para validar el lote"
      maxWidth="md"
      footer={
        <div className="flex items-center gap-2 w-full justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyLink}
              icon={copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            >
              {copied ? '¡Copiado!' : 'Copiar URL'}
            </Button>
            <a
              href={verificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#0F6CBD]" />
              <span>Abrir Portal</span>
            </a>
          </div>
          <Button variant="teal" size="sm" onClick={onClose} icon={<QrCode className="w-4 h-4" />}>
            Cerrar
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center justify-center p-4 text-center space-y-4">
        {/* Real standard QR code with high error correction */}
        <TraceabilityQRCode
          qrToken={effectiveToken}
          lotCode={lotCode}
          size={190}
          includeText={false}
        />

        <div className="space-y-1">
          <span className="text-base font-bold text-[#0F6CBD] block">{lotCode}</span>
          <p className="text-xs text-slate-700 font-medium">{productName}</p>
          <p className="text-[11px] font-mono text-slate-500 break-all pt-1 max-w-sm">
            {verificationUrl}
          </p>
        </div>
      </div>
    </Modal>
  );
};
