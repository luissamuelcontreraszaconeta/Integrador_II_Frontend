import React from 'react';
import { useLots } from '../../context/LotContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable, Column } from '../../components/ui/DataTable';
import { MOCK_USERS } from '../../data/mockData';
import { User, AuditLog } from '../../types/user';
import { History, Users } from 'lucide-react';

interface AdminPageProps {
  onNavigate: (path: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  const { auditLogs } = useLots();
  const usersList: User[] = MOCK_USERS;

  const columns: Column<AuditLog>[] = [
    {
      header: 'Fecha / Hora',
      cell: (item: AuditLog) => (
        <span className="font-mono text-xs text-slate-400">
          {new Date(item.timestamp).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Usuario',
      cell: (item: AuditLog) => (
        <div>
          <span className="font-semibold text-slate-200 block text-xs">{item.userName}</span>
          <span className="text-[10px] text-slate-500 uppercase">{item.userRole}</span>
        </div>
      ),
    },
    {
      header: 'Acción Auditada',
      cell: (item: AuditLog) => (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-teal-300 border border-slate-700">
          {item.action}
        </span>
      ),
    },
    {
      header: 'Detalles del Evento',
      accessorKey: 'details',
      cell: (item: AuditLog) => <span className="text-xs text-slate-300">{item.details}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Administración del Sistema & Auditoría"
        subtitle="Registro inmutable de trazabilidad de acciones y configuración de parámetros corporativos"
        breadcrumbs={[{ label: 'Inicio', onClick: () => onNavigate('/dashboard') }, { label: 'Administración' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: User roles catalog */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Users className="w-4 h-4 text-teal-400" />
            Usuarios y Perfiles Registrados
          </h3>
          <div className="space-y-3">
            {usersList.map((usr: User) => (
              <div key={usr.id} className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-200 block">{usr.name}</span>
                  <span className="text-[10px] text-slate-400">{usr.email}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                  {usr.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Audit Log Trail */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            Registro de Auditoría de Sistema (System Trail)
          </h3>
          <DataTable columns={columns} data={auditLogs} keyExtractor={(item: AuditLog) => item.id} />
        </div>
      </div>
    </div>
  );
};
