import React, { useState } from 'react';
import { useLots } from '../../context/LotContext';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable, Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { QRCodeModal } from '../../components/lots/QRCodeModal';
import { Lot, LotStatus } from '../../types/lot';
import { Plus, Search, Eye, QrCode, Filter, RefreshCw } from 'lucide-react';

interface LotsListPageProps {
  onNavigate: (path: string) => void;
}

export const LotsListPage: React.FC<LotsListPageProps> = ({ onNavigate }) => {
  const { lots, refreshData, loading } = useLots();
  const { currentRole } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedQrLot, setSelectedQrLot] = useState<Lot | null>(null);

  const filteredLots = lots.filter((lot) => {
    const matchesSearch =
      lot.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lot.production.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lot.production.vesselName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lot.production.supplier.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || lot.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const columns: Column<Lot>[] = [
    {
      header: 'Código Lote',
      accessorKey: 'code',
      cell: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate(`/lots/${item.id}`)}
            className="font-bold text-teal-400 hover:underline cursor-pointer"
          >
            {item.code}
          </button>
          <button
            onClick={() => setSelectedQrLot(item)}
            className="p-1 rounded text-slate-400 hover:text-teal-300 hover:bg-slate-800 transition-colors"
            title="Ver Código QR"
          >
            <QrCode className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
    {
      header: 'Producto / Especie',
      cell: (item) => (
        <div>
          <span className="font-semibold text-slate-100 block text-xs">{item.production.productName}</span>
          <span className="text-[10px] text-slate-400 italic">{item.production.scientificName}</span>
        </div>
      ),
    },
    {
      header: 'Fecha Registro',
      cell: (item) => (
        <span className="text-xs text-slate-300">
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Volumen',
      cell: (item) => (
        <span className="font-mono font-bold text-slate-200 text-xs">
          {item.production.quantity} {item.production.unit}
        </span>
      ),
    },
    {
      header: 'Estado General',
      cell: (item) => <StatusBadge status={item.status} size="sm" />,
    },
    {
      header: 'Responsable',
      cell: (item) => (
        <span className="text-xs text-slate-400">{item.createdBy}</span>
      ),
    },
    {
      header: 'Acciones',
      cell: (item) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate(`/lots/${item.id}`)}
            icon={<Eye className="w-3.5 h-3.5" />}
          >
            Detalle
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Lotes Digitales"
        subtitle="Registro, trazabilidad integral y consulta unificada por lote de exportación"
        breadcrumbs={[{ label: 'Inicio' }, { label: 'Lotes' }]}
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Actualizar
            </Button>
            {(currentRole === 'ADMINISTRADOR' || currentRole === 'PRODUCCION') && (
              <Button
                variant="teal"
                size="md"
                onClick={() => onNavigate('/lots/new')}
                icon={<Plus className="w-4 h-4" />}
              >
                + Registrar Lote
              </Button>
            )}
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-80">
          <Input
            placeholder="Buscar por código, producto, embarcación..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 w-full md:w-64">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'Todos los estados' },
                { value: 'DRAFT', label: 'Borrador' },
                { value: 'PENDING_QA', label: 'Pendiente QA' },
                { value: 'IN_QA', label: 'En QA' },
                { value: 'OBSERVED', label: 'Observados' },
                { value: 'VALIDATION_PENDING', label: 'Pendiente Validación' },
                { value: 'READY_FOR_CERTIFICATION', label: 'Apto Certificación' },
                { value: 'IN_CERTIFICATION', label: 'En Certificación' },
                { value: 'CERTIFIED', label: 'Certificado SANIPES' },
                { value: 'READY_FOR_DISPATCH', label: 'Apto Despacho' },
                { value: 'DISPATCHED', label: 'Despachado' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredLots}
        keyExtractor={(item) => item.id}
        isLoading={loading}
        emptyMessage="No se encontraron lotes con los criterios especificados."
      />

      {/* QR Code Modal Popup */}
      {selectedQrLot && (
        <QRCodeModal
          isOpen={Boolean(selectedQrLot)}
          onClose={() => setSelectedQrLot(null)}
          lotCode={selectedQrLot.code}
          productName={selectedQrLot.production.productName}
        />
      )}
    </div>
  );
};
