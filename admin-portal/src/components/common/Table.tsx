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
          <td key={`skeleton-col-${colIndex}`} className="py-4 px-6">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
          </td>
        ))}
      </tr>
    ));
  };

  const renderEmptyState = () => (
    <tr>
      <td colSpan={columns.length} className="py-12 px-6 text-center">
        <div className="flex flex-col items-center justify-center text-text-secondary">
          <FileX className="w-12 h-12 mb-4 opacity-50" />
          <p className="font-medium">{emptyStateMessage}</p>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="w-full flex flex-col h-full flex-1">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-gray-50/50">
              {columns.map((col, i) => (
                <th key={i} className={`py-4 px-6 text-xs font-black text-text-secondary uppercase tracking-widest ${col.className || ''}`}>
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
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  onClick={() => onRowClick?.(item)}
                  className={`group transition-colors ${onRowClick ? 'cursor-pointer hover:bg-gray-50/80' : 'hover:bg-gray-50/50'}`}
                >
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className={`py-4 px-6 whitespace-nowrap text-sm ${col.className || ''}`}>
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
        <div className="mt-auto px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-b-xl">
          <p className="text-sm text-text-secondary font-medium">
            Showing page <span className="font-bold text-brand-navy">{currentPage}</span> of <span className="font-bold text-brand-navy">{totalPages}</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border border-border text-text-secondary hover:bg-gray-50 hover:text-brand-navy disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="hidden sm:flex items-center gap-1 px-2">
              {getPageNumbers().map((page, idx) => (
                <button
                  key={idx}
                  onClick={() => typeof page === 'number' ? onPageChange(page) : undefined}
                  disabled={page === '...'}
                  className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${page === currentPage
                      ? 'bg-brand-navy text-white shadow-sm'
                      : page === '...'
                        ? 'text-text-secondary cursor-default'
                        : 'text-text-secondary hover:bg-gray-50 hover:text-brand-navy'
                    }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border border-border text-text-secondary hover:bg-gray-50 hover:text-brand-navy disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white shadow-sm"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
