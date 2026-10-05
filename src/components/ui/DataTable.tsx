import React from 'react';
import { Loader2 } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  isLoading?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No se encontraron registros',
  isLoading = false,
}: DataTableProps<T>) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
      <table className="w-full text-left text-sm text-slate-700 border-collapse">
        <thead className="bg-slate-50/90 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className={`px-4 py-3.5 ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-500">
                <div className="flex flex-col items-center justify-center gap-2.5">
                  <Loader2 className="w-6 h-6 animate-spin text-[#0F6CBD]" />
                  <span className="text-xs font-semibold">Cargando datos del sistema...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-slate-500 text-xs font-medium">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={keyExtractor(item)}
                className="hover:bg-slate-50/80 transition-colors duration-150 group"
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={`px-4 py-3.5 align-middle ${col.className || ''}`}>
                    {col.cell
                      ? col.cell(item)
                      : col.accessorKey
                      ? String(item[col.accessorKey] ?? '')
                      : null}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
