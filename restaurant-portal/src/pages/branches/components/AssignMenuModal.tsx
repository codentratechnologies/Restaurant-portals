import { useState, useMemo } from 'react';
import { Search, Loader2 } from 'lucide-react';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';

interface FoodItem {
  id: string;
  code: string;
  name: string;
  category: string;
  price: number;
}

const ALL_FOOD_ITEMS: FoodItem[] = [
  { id: 'f1', code: 'ITM-001', name: 'Margherita Pizza', category: 'Main Course', price: 12.99 },
  { id: 'f2', code: 'ITM-002', name: 'Caesar Salad', category: 'Appetizers', price: 8.99 },
  { id: 'f3', code: 'ITM-003', name: 'Garlic Bread', category: 'Appetizers', price: 4.99 },
  { id: 'f4', code: 'ITM-004', name: 'Spaghetti Bolognese', category: 'Main Course', price: 14.99 },
  { id: 'f5', code: 'ITM-005', name: 'Tiramisu', category: 'Desserts', price: 6.99 },
];

export default function AssignMenuModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(['f1', 'f3'])); // mock pre-selected
  const [isSaving, setIsSaving] = useState(false);

  const filteredItems = useMemo(() => {
    let result = ALL_FOOD_ITEMS;
    if (searchQuery.length >= 2) {
      const q = searchQuery.toLowerCase();
      result = result.filter(i => i.name.toLowerCase().includes(q) || i.code.toLowerCase().includes(q));
    }
    if (categoryFilter !== 'All') {
      result = result.filter(i => i.category === categoryFilter);
    }
    return result;
  }, [searchQuery, categoryFilter]);

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map(i => i.id)));
    }
  };

  const handleSave = async () => {
    if (selectedIds.size === 0) {
      if (!window.confirm('You are saving an empty menu. Are you sure?')) return;
    }
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setIsSaving(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Menu — MG Road (B001)" maxWidth="2xl">
      <div className="flex flex-col h-[70vh]">
        {/* Filters */}
        <div className="p-4 border-b border-border bg-gray-50 flex gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              placeholder="Search food items..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-brand-orange-500"
            />
          </div>
          <select 
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="border border-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-brand-orange-500"
          >
            <option value="All">All Categories</option>
            <option value="Appetizers">Appetizers</option>
            <option value="Main Course">Main Course</option>
            <option value="Desserts">Desserts</option>
          </select>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50/50">
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

          {filteredItems.map(item => (
            <label 
              key={item.id} 
              className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all ${
                selectedIds.has(item.id) ? 'bg-orange-50/50 border-brand-orange-500 shadow-sm' : 'bg-white border-border hover:border-brand-orange-300'
              }`}
            >
              <input 
                type="checkbox"
                checked={selectedIds.has(item.id)}
                onChange={() => toggleSelection(item.id)}
                className="mr-4 cursor-pointer accent-brand-orange-500 w-4 h-4 rounded"
              />
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
          ))}
          {filteredItems.length === 0 && (
            <div className="text-center py-10 text-text-secondary">No food items found.</div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-white flex items-center justify-between">
          <span className="text-sm font-bold text-text-secondary">
            {selectedIds.size} item{selectedIds.size !== 1 && 's'} selected
          </span>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
