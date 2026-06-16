import { useState, useMemo, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export interface FoodItem {
  id: string;
  code: string;
  name: string;
  category: string;
  price: number;
}

export const ALL_FOOD_ITEMS: FoodItem[] = [
  { id: 'f1', code: 'ITM-001', name: 'Margherita Pizza', category: 'Main Course', price: 12.99 },
  { id: 'f2', code: 'ITM-002', name: 'Caesar Salad', category: 'Appetizers', price: 8.99 },
  { id: 'f3', code: 'ITM-003', name: 'Garlic Bread', category: 'Appetizers', price: 4.99 },
  { id: 'f4', code: 'ITM-004', name: 'Spaghetti Bolognese', category: 'Main Course', price: 14.99 },
  { id: 'f5', code: 'ITM-005', name: 'Tiramisu', category: 'Desserts', price: 6.99 },
  { id: 'f6', code: 'ITM-006', name: 'Lemonade', category: 'Beverages', price: 3.99 },
  { id: 'f7', code: 'ITM-007', name: 'Mushroom Risotto', category: 'Main Course', price: 16.99 },
  { id: 'f8', code: 'ITM-008', name: 'Caprese Salad', category: 'Appetizers', price: 9.99 },
  { id: 'f9', code: 'ITM-009', name: 'Fettuccine Alfredo', category: 'Main Course', price: 13.99 },
  { id: 'f10', code: 'ITM-010', name: 'Cheesecake', category: 'Desserts', price: 7.99 },
  { id: 'f11', code: 'ITM-011', name: 'Iced Tea', category: 'Beverages', price: 2.99 },
  { id: 'f12', code: 'ITM-012', name: 'Bruschetta', category: 'Appetizers', price: 5.99 },
  { id: 'f13', code: 'ITM-013', name: 'Lasagna', category: 'Main Course', price: 15.99 },
];

interface AssignMenuStepProps {
  selectedIds: Set<string>;
  onChange: (newSelectedIds: Set<string>) => void;
  readOnly?: boolean;
}

export default function AssignMenuStep({ selectedIds, onChange, readOnly = false }: AssignMenuStepProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filteredItems = useMemo(() => {
    let result = ALL_FOOD_ITEMS;
    if (searchQuery.length >= 2) {
      const q = searchQuery.toLowerCase();
      result = result.filter(i => i.name.toLowerCase().includes(q) || i.code.toLowerCase().includes(q));
    }
    if (categoryFilter !== 'All') {
      result = result.filter(i => i.category === categoryFilter);
    }
    // If read-only, only show selected items
    if (readOnly) {
      result = result.filter(i => selectedIds.has(i.id));
    }
    return result;
  }, [searchQuery, categoryFilter, selectedIds, readOnly]);

  const ITEMS_PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

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

  const toggleSelection = (id: string) => {
    if (readOnly) return;
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(next);
  };

  const toggleAll = () => {
    if (readOnly) return;
    if (selectedIds.size === filteredItems.length && filteredItems.length > 0) {
      onChange(new Set());
    } else {
      onChange(new Set(filteredItems.map(i => i.id)));
    }
  };

  return (
    <div className="flex flex-col h-[500px]">
      {/* Filters */}
      <div className="p-4 border-b border-border bg-gray-50 flex flex-col sm:flex-row gap-4 items-center justify-between rounded-t-xl">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <h3 className="text-lg font-black text-brand-navy">Assigned Menu Items</h3>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              placeholder="Search food items..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-sm font-medium focus:outline-none focus:border-brand-orange-500 focus:ring-1 focus:ring-brand-orange-500 shadow-sm"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="border border-border rounded-lg px-3 py-2 text-sm font-medium bg-white focus:outline-none focus:border-brand-orange-500 focus:ring-1 focus:ring-brand-orange-500 shadow-sm"
          >
            <option value="All">All Categories</option>
            <option value="Appetizers">Appetizers</option>
            <option value="Main Course">Main Course</option>
            <option value="Desserts">Desserts</option>
            <option value="Beverages">Beverages</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50/30">
        {!readOnly && (
          <div className="flex items-center px-4 py-2 text-sm font-bold text-text-secondary border-b border-border mb-2">
            <input
              type="checkbox"
              className="mr-4 cursor-pointer accent-brand-orange-500 w-4 h-4 rounded"
              checked={selectedIds.size > 0 && selectedIds.size === filteredItems.length}
              onChange={toggleAll}
            />
            <span className="flex-1">Food Item</span>
            <span className="w-24 text-right">Price</span>
          </div>
        )}

        {paginatedItems.map(item => {
          const isSelected = selectedIds.has(item.id);
          return (
            <label
              key={item.id}
              className={`flex items-center p-4 rounded-xl border transition-all ${isSelected && !readOnly ? 'bg-orange-50/50 border-brand-orange-500 shadow-sm cursor-pointer'
                  : readOnly ? 'bg-white border-border'
                    : 'bg-white border-border hover:border-brand-orange-300 cursor-pointer'
                }`}
            >
              {!readOnly && (
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelection(item.id)}
                  className="mr-4 cursor-pointer accent-brand-orange-500 w-4 h-4 rounded"
                />
              )}
              <div className="flex-1">
                <p className="font-bold text-brand-navy">{item.name}</p>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-text-secondary">
                  <span className="font-mono">{item.code}</span>
                  <span>•</span>
                  <span>{item.category}</span>
                </div>
              </div>
              <div className="font-bold text-brand-navy">${item.price.toFixed(2)}</div>
            </label>
          );
        })}
        {filteredItems.length === 0 && (
          <div className="text-center py-10 text-text-secondary font-medium">
            {readOnly ? "No menu items assigned yet." : "No food items found matching your criteria."}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages !== undefined && (
        <div className="p-4 border-t border-border bg-white flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-xl shrink-0">
          <p className="text-sm text-text-secondary font-medium">
            Showing page <span className="font-bold text-brand-navy">{currentPage}</span> of <span className="font-bold text-brand-navy">{totalPages}</span>
          </p>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
                  onClick={() => typeof page === 'number' ? setCurrentPage(page) : undefined}
                  disabled={page === '...'}
                  className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                    page === currentPage
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
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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
