import React, { useState } from 'react';
import { useLots } from '../../context/LotContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { ProductType, UnitType } from '../../types/lot';
import { Package, Ship, Factory, Save, Send, X, Anchor } from 'lucide-react';

interface RegisterLotPageProps {
  onNavigate: (path: string) => void;
}

export const RegisterLotPage: React.FC<RegisterLotPageProps> = ({ onNavigate }) => {
  const { createLot } = useLots();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [productType, setProductType] = useState<ProductType>('POTA_CONGELADA_BLOCK');
  const [productName, setProductName] = useState('Pota congelada en bloques (Giant Squid Blocks)');
  const [scientificName, setScientificName] = useState('Dosidicus gigas');
  const [quantity, setQuantity] = useState<number>(24.5);
  const [unit, setUnit] = useState<UnitType>('TN');

  const [supplier, setSupplier] = useState('Asociación Pesquera Artesanal Paita Norte');
  const [vesselName, setVesselName] = useState('E/P Don Luis II (CO-18492-PM)');
  const [receptionDate, setReceptionDate] = useState(new Date().toISOString().split('T')[0]);
  const [portOfOrigin, setPortOfOrigin] = useState('Puerto de Paita, Piura');

  const [processingType, setProcessingType] = useState('Bloque Congelado Rápido (-40°C)');
  const [productionLine, setProductionLine] = useState('Línea 02 - Bloques Exportación');
  const [shiftSupervisor, setShiftSupervisor] = useState('Ing. Marco Ugarte');
  const [notes, setNotes] = useState('Materia prima de primera frescura, captura nocturna artesanal.');

  const productTypeOptions = [
    { value: 'POTA_CONGELADA_BLOCK', label: 'Pota congelada en bloques (Dosidicus gigas)' },
    { value: 'POTA_ANILLOS_IQF', label: 'Anillos de Pota IQF (Dosidicus gigas)' },
    { value: 'LANGOSTINO_ENTERO', label: 'Langostino Entero (Penaeus vannamei)' },
    { value: 'LANGOSTINO_COLA_IQF', label: 'Langostino Cola IQF (Penaeus vannamei)' },
    { value: 'MERLUZA_FILETE_HG', label: 'Filete de Merluza HG (Merluccius gayi peruanus)' },
    { value: 'JUREL_ENTERO_CONGELADO', label: 'Jurel Entero Congelado (Trachurus murphyi)' },
    { value: 'CONCHA_DE_ABANICO', label: 'Concha de Abanico en Capellanes (Argopecten purpuratus)' },
  ];

  const handleProductChange = (val: string) => {
    setProductType(val as ProductType);
    if (val.includes('POTA')) {
      setScientificName('Dosidicus gigas');
      setProductName(val === 'POTA_CONGELADA_BLOCK' ? 'Pota congelada en bloques' : 'Anillos de Pota IQF');
    } else if (val.includes('LANGOSTINO')) {
      setScientificName('Penaeus vannamei');
      setProductName('Langostino Entero IQF Exportación');
    } else if (val.includes('MERLUZA')) {
      setScientificName('Merluccius gayi peruanus');
      setProductName('Filete de Merluza HG Sin Piel');
    } else if (val.includes('JUREL')) {
      setScientificName('Trachurus murphyi');
      setProductName('Jurel Entero Congelado Block');
    } else {
      setScientificName('Argopecten purpuratus');
      setProductName('Concha de Abanico en Medias Valvas');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newLot = await createLot({
        productName,
        productType,
        scientificName,
        quantity: Number(quantity),
        unit,
        supplier,
        vesselName,
        receptionDate,
        portOfOrigin,
        processingType,
        productionLine,
        shiftSupervisor,
        notes,
      });
      onNavigate(`/lots/${newLot.id}`);
    } catch (err) {
      console.error('Error registrando lote:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Registrar Nuevo Lote Digital"
        subtitle="Alta de lote en sistema con código único EXP-2026-XXX y código QR automático"
        breadcrumbs={[
          { label: 'Inicio', onClick: () => onNavigate('/dashboard') },
          { label: 'Lotes', onClick: () => onNavigate('/lots') },
          { label: 'Nuevo Lote' },
        ]}
      />

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: General Product Info */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <Package className="w-5 h-5 text-teal-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
              1. Información General del Producto
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Select
                label="Tipo de Producto Hidrobiológico"
                required
                value={productType}
                onChange={(e) => handleProductChange(e.target.value)}
                options={productTypeOptions}
              />
            </div>
            <Input
              label="Nombre Comercial del Producto"
              required
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
            <Input
              label="Nombre Científico de la Especie"
              required
              value={scientificName}
              onChange={(e) => setScientificName(e.target.value)}
            />
            <Input
              label="Cantidad / Volumen Total"
              type="number"
              step="0.1"
              required
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
            <Select
              label="Unidad de Medida"
              required
              value={unit}
              onChange={(e) => setUnit(e.target.value as UnitType)}
              options={[
                { value: 'TN', label: 'Toneladas Métricas (TN)' },
                { value: 'KG', label: 'Kilogramos (KG)' },
                { value: 'CAJAS', label: 'Cajas Master' },
                { value: 'PALLETS', label: 'Pallets' },
              ]}
            />
          </div>
        </div>

        {/* Section 2: Origin & Vessel Info */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <Ship className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
              2. Información de Origen y Desembarque
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Proveedor / Armador Pesquero"
              required
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
            />
            <Input
              label="Embarcación Pesquera / Matrícula"
              required
              value={vesselName}
              onChange={(e) => setVesselName(e.target.value)}
            />
            <Input
              label="Fecha de Recepción en Planta"
              type="date"
              required
              value={receptionDate}
              onChange={(e) => setReceptionDate(e.target.value)}
            />
            <Input
              label="Puerto de Origen / Caleta"
              required
              value={portOfOrigin}
              onChange={(e) => setPortOfOrigin(e.target.value)}
            />
          </div>
        </div>

        {/* Section 3: Production & Processing Line */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <Factory className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
              3. Especificaciones de Producción en Planta
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Tipo de Procesamiento"
              required
              value={processingType}
              onChange={(e) => setProcessingType(e.target.value)}
            />
            <Input
              label="Línea de Producción Asignada"
              required
              value={productionLine}
              onChange={(e) => setProductionLine(e.target.value)}
            />
            <Input
              label="Supervisores / Responsable de Turno"
              required
              value={shiftSupervisor}
              onChange={(e) => setShiftSupervisor(e.target.value)}
            />
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Observaciones de Producción
              </label>
              <textarea
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button
            variant="outline"
            size="lg"
            type="button"
            onClick={() => onNavigate('/lots')}
            icon={<X className="w-4 h-4" />}
          >
            Cancelar
          </Button>
          <Button
            variant="teal"
            size="lg"
            type="submit"
            isLoading={isSubmitting}
            icon={<Send className="w-4 h-4" />}
          >
            Registrar Lote & Generar QR (PENDING_QA)
          </Button>
        </div>
      </form>
    </div>
  );
};
