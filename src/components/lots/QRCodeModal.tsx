import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { QrCode, Download, ExternalLink, ShieldCheck, Copy, Check } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  lotCode: string;
  productName: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  lotCode,
  productName,
}) => {
  const [copied, setCopied] = React.useState(false);
  const fakeHash = `0x${Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
  const verificationUrl = `https://exportrace.sanipes.gob.pe/verify/${lotCode}?hash=${fakeHash}`;

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
      subtitle="Escanee para validar la autenticidad del expediente digital sanitario"
      maxWidth="md"
      footer={
        <div className="flex items-center gap-2 w-full justify-between">
          <Button variant="outline" size="sm" onClick={copyLink} icon={copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}>
            {copied ? '¡Copiado!' : 'Copiar URL'}
          </Button>
          <Button variant="teal" size="sm" onClick={onClose} icon={<QrCode className="w-4 h-4" />}>
            Cerrar
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center justify-center p-4 text-center space-y-4">
        {/* Simulated high-quality QR code vector pattern */}
        <div className="p-4 bg-white rounded-2xl shadow-xl border-4 border-teal-500/40 inline-block">
          <svg className="w-48 h-48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" fill="white" />
            {/* Corners positioning squares */}
            <rect x="5" y="5" width="25" height="25" fill="#0f172a" rx="2" />
            <rect x="9" y="9" width="17" height="17" fill="white" rx="1" />
            <rect x="13" y="13" width="9" height="9" fill="#0d9488" rx="1" />

            <rect x="70" y="5" width="25" height="25" fill="#0f172a" rx="2" />
            <rect x="74" y="9" width="17" height="17" fill="white" rx="1" />
            <rect x="78" y="13" width="9" height="9" fill="#0d9488" rx="1" />

            <rect x="5" y="70" width="25" height="25" fill="#0f172a" rx="2" />
            <rect x="9" y="74" width="17" height="17" fill="white" rx="1" />
            <rect x="13" y="78" width="9" height="9" fill="#0d9488" rx="1" />

            {/* Random Matrix Data Blocks */}
            <rect x="35" y="10" width="6" height="6" fill="#0f172a" />
            <rect x="45" y="10" width="6" height="6" fill="#0d9488" />
            <rect x="55" y="10" width="6" height="6" fill="#0f172a" />
            
            <rect x="35" y="25" width="6" height="6" fill="#0d9488" />
            <rect x="45" y="25" width="6" height="6" fill="#0f172a" />

            <rect x="10" y="35" width="6" height="6" fill="#0f172a" />
            <rect x="20" y="35" width="6" height="6" fill="#0f172a" />
            <rect x="35" y="35" width="6" height="6" fill="#0f172a" />
            <rect x="45" y="35" width="6" height="6" fill="#0d9488" />
            <rect x="60" y="35" width="6" height="6" fill="#0f172a" />
            <rect x="75" y="35" width="6" height="6" fill="#0f172a" />

            <rect x="35" y="50" width="6" height="6" fill="#0d9488" />
            <rect x="50" y="50" width="6" height="6" fill="#0f172a" />
            <rect x="65" y="50" width="6" height="6" fill="#0d9488" />
            <rect x="80" y="50" width="6" height="6" fill="#0f172a" />

            <rect x="35" y="65" width="6" height="6" fill="#0f172a" />
            <rect x="45" y="65" width="6" height="6" fill="#0f172a" />
            <rect x="60" y="65" width="6" height="6" fill="#0d9488" />
            <rect x="75" y="65" width="6" height="6" fill="#0f172a" />

            <rect x="40" y="80" width="6" height="6" fill="#0f172a" />
            <rect x="55" y="80" width="6" height="6" fill="#0f172a" />
            <rect x="70" y="80" width="6" height="6" fill="#0d9488" />
            <rect x="85" y="80" width="6" height="6" fill="#0f172a" />
          </svg>
        </div>

        <div>
          <span className="text-base font-bold text-teal-400 block">{lotCode}</span>
          <p className="text-xs text-slate-300 font-medium mt-0.5">{productName}</p>
          <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-slate-800 text-[11px] text-slate-400 border border-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>Firma digital: {fakeHash}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};
