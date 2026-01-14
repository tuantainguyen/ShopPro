
import React, { useState, useEffect } from 'react';
import { Product, Category, Unit } from '../types';

interface Props {
  product?: Product;
  categories: Category[];
  units: Unit[];
  onSave: (product: Partial<Product>) => void;
  onClose: () => void;
}

const ProductModal: React.FC<Props> = ({ product, categories, units, onSave, onClose }) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    categoryId: categories[0]?.id || '',
    unit: units[0]?.name || 'Cái',
    price: 0,
    costPrice: 0,
    initialStock: 0,
  });

  useEffect(() => {
    if (product) setFormData(product);
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight">{product ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Tên sản phẩm *</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 ring-emerald-500 outline-none"
              placeholder="Ví dụ: Cà phê sữa"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Chủng loại</label>
            <select
              value={formData.categoryId}
              onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 ring-emerald-500 outline-none"
            >
              <option value="">Chọn chủng loại</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Đơn vị tính</label>
              <select
                required
                value={formData.unit}
                onChange={e => setFormData({ ...formData, unit: e.target.value })}
                className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 ring-emerald-500 outline-none"
              >
                <option value="">Chọn ĐVT</option>
                {units.map(u => (
                  <option key={u.id} value={u.name}>{u.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Tồn kho đầu</label>
              <input
                type="number"
                disabled={!!product}
                value={formData.initialStock}
                onChange={e => setFormData({ ...formData, initialStock: Number(e.target.value) })}
                className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 ring-emerald-500 outline-none disabled:opacity-50"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Giá vốn (Cost)</label>
              <input
                type="number"
                value={formData.costPrice}
                onChange={e => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 ring-indigo-500 outline-none font-bold text-slate-600"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Giá bán (Price)</label>
              <input
                type="number"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 ring-emerald-500 outline-none font-bold text-emerald-600"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 py-4 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-shadow shadow-lg shadow-emerald-200"
            >
              Lưu sản phẩm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
