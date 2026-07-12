import { ReactNode } from 'react';
import { ChevronLeft, ChevronRight, FileX } from 'lucide-react';
import { motion } from 'framer-motion';

export interface Column<T> {
  header: string;
  accessor?: keyof T;
  cell?: (item: T) => ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyStateMessage?: string;
  onRowClick?: (item: T) => void;
  // Pagination props
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  onItemsPerPageChange?: (limit: number) => void;
  itemsPerPageOptions?: number[];
}

export default function Table<T extends { id: string | number }>({
  columns,
  data,
  isLoading = false,
  emptyStateMessage = 'No records found',
  onRowClick,
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  onItemsPerPageChange,
  itemsPerPageOptions = [5, 10, 25, 50],
}: TableProps<T>) {

  const getPageNumbers = () => {
    if (!totalPages || !currentPage) return [];
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const renderSkeletons = () => {
    return Array.from({ length: 5 }).map((_, i) => (
      <tr key={`skeleton-${i}`} className="border-b border-border/50">
        {columns.map((_, colIndex) => (
          <td key={`skeleton-col-${colIndex}`} className="py-5 px-6">
            <div className="h-5 bg-gradient-to-r from-gray-100 via-gray-200/50 to-gray-100 bg-[length:200%_100%] animate-pulse rounded-lg w-3/4 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"></div>
          </td>
        ))}
      </tr>
    ));
  };

  const renderEmptyState = () => (
    <tr>
      <td colSpan={columns.length} className="py-24 px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center text-text-secondary"
        >
          <div className="relative w-24 h-24 mb-6 rounded-[2rem] bg-gray-50/80 flex items-center justify-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] border border-border/50 rotate-3 group-hover:rotate-0 transition-transform">
            <div className="absolute inset-0 rounded-[2rem] bg-brand-orange-500/5 animate-pulse" />
            <FileX className="w-10 h-10 text-brand-orange-400 drop-shadow-sm -rotate-3" />
          </div>
          <h3 className="text-xl font-black text-brand-navy mb-2 tracking-tight">No Records Found</h3>
          <p className="font-bold text-sm max-w-[280px] text-center leading-relaxed opacity-80">{emptyStateMessage}</p>
        </motion.div>
      </td>
    </tr>
  );

  return (
    <div className="w-full flex flex-col h-full flex-1">
      <div className="overflow-x-auto bg-white rounded-2xl border border-border/50 shadow-sm">
        <table className="w-full text-left border-collapse min-w-[800px] whitespace-nowrap">
          <thead>
            <tr className="bg-gray-50/50 border-b border-border/50">
              {columns.map((col, i) => (
                <th key={i} className={`px-6 py-5 text-xs font-bold text-text-secondary uppercase tracking-wider ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {isLoading ? (
              renderSkeletons()
            ) : data.length === 0 ? (
              renderEmptyState()
            ) : (
              data.map((item, i) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                  onClick={() => onRowClick?.(item)}
                  className={`hover:bg-gray-50/50 transition-colors group ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className={`px-6 py-5 whitespace-nowrap text-sm ${col.className || ''}`}>
                      {col.cell ? col.cell(item) : col.accessor ? String(item[col.accessor]) : null}
                    </td>
                  ))}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!isLoading && totalPages !== undefined && currentPage !== undefined && onPageChange && (
        <div className="mt-auto px-4 sm:px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50 rounded-b-xl">
          <p className="hidden sm:block text-sm text-text-secondary font-medium">
            Showing page <span className="font-bold text-brand-navy">{currentPage}</span> of <span className="font-bold text-brand-navy">{totalPages}</span>
          </p>

          <div className="flex items-center justify-center w-full sm:w-auto gap-2 sm:gap-3 mx-auto sm:mx-0">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg border border-border hover:bg-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0 bg-transparent"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-brand-orange-500" />
            </button>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {getPageNumbers().map((page, idx) => (
                <button
                  key={idx}
                  onClick={() => typeof page === 'number' ? onPageChange(page) : undefined}
                  disabled={page === '...'}
                  className={`min-w-[32px] sm:min-w-[40px] h-8 sm:h-10 flex items-center justify-center rounded-lg text-sm sm:text-base font-bold transition-all ${
                    page === currentPage
                      ? 'bg-gradient-to-br from-brand-orange-400 to-brand-orange-600 text-white shadow-md border-none shadow-brand-orange-500/20'
                      : page === '...'
                        ? 'text-text-secondary cursor-default border-none bg-transparent'
                        : 'bg-transparent border border-border text-text-secondary hover:text-brand-navy hover:bg-white shadow-sm'
                    }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg border border-border hover:bg-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0 bg-transparent"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-brand-orange-500" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
