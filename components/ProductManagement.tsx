
import React, { useState } from 'react';
import { Product, Category, Unit } from '../types';
import { Icons, CURRENCY } from '../constants';
import ProductModal from './ProductModal';
import { formatCurrency } from '../utils/formatters';

interface Props {
  products: Product[];
  categories: Category[];
  units: Unit[];
  onAddProduct: (p: Partial<Product>) => void;
  onUpdateProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
  onAddCategory: (name: string) => void;
  onDeleteCategory: (id: string) => void;
  onAddUnit: (name: string) => void;
  onDeleteUnit: (id: string) => void;
}

const ProductManagement: React.FC<Props> = ({ 
  products, categories, units, onAddProduct, onUpdateProduct, onDeleteProduct, onAddCategory, onDeleteCategory, onAddUnit, onDeleteUnit
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [newCatName, setNewCatName] = useState('');
  const [newUnitName, setNewUnitName] = useState('');

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || p.categoryId === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatName.trim()) {
      onAddCategory(newCatName.trim());
      setNewCatName('');
    }
  };

  const handleAddUnitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUnitName.trim()) {
      onAddUnit(newUnitName.trim());
      setNewUnitName('');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Quản lý Sản phẩm</h2>
          <p className="text-slate-500 text-sm">Danh mục sản phẩm, chủng loại và đơn vị tính.</p>
        </div>
        <button
          onClick={() => { setEditingProduct(undefined); setIsProductModalOpen(true); }}
          className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all"
        >
          <Icons.Plus /> Thêm sản phẩm
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories & Units Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Categories Section */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2"><Icons.Folder /> Chủng loại</h3>
            <div className="space-y-1 mb-6">
              <button
                onClick={() => setActiveCategory('all')}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeCategory === 'all' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                Tất cả sản phẩm
              </button>
              {categories.map(cat => (
                <div key={cat.id} className="group flex items-center justify-between gap-1">
                  <button
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex-1 text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeCategory === cat.id ? 'bg-emerald-50 text-emerald-600' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    {cat.name}
                  </button>
                  <button 
                    onClick={() => onDeleteCategory(cat.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="Xóa chủng loại"
                  >
                    <Icons.Trash />
                  </button>
                </div>
              ))}
            </div>
            
            <form onSubmit={handleAddCat} className="pt-6 border-t border-slate-50">
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Loại mới..."
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs w-full outline-none focus:ring-2 ring-emerald-500 focus:bg-white transition-all"
                />
                <button 
                  type="submit" 
                  disabled={!newCatName.trim()}
                  className="w-full py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all disabled:opacity-30"
                >
                  Thêm loại
                </button>
              </div>
            </form>
          </div>

          {/* Units Section */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2"><Icons.Database /> Đơn vị tính</h3>
            <div className="space-y-1 mb-6 max-h-40 overflow-y-auto custom-scrollbar">
              {units.map(unit => (
                <div key={unit.id} className="group flex items-center justify-between gap-1">
                  <span className="flex-1 px-4 py-2 rounded-xl text-xs font-bold text-slate-600">
                    {unit.name}
                  </span>
                  <button 
                    onClick={() => onDeleteUnit(unit.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="Xóa đơn vị"
                  >
                    <Icons.Trash />
                  </button>
                </div>
              ))}
            </div>
            
            <form onSubmit={handleAddUnitForm} className="pt-6 border-t border-slate-50">
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="ĐVT mới..."
                  value={newUnitName}
                  onChange={e => setNewUnitName(e.target.value)}
                  className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs w-full outline-none focus:ring-2 ring-indigo-500 focus:bg-white transition-all"
                />
                <button 
                  type="submit" 
                  disabled={!newUnitName.trim()}
                  className="w-full py-2.5 bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-700 transition-all disabled:opacity-30"
                >
                  Thêm ĐVT
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Product List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
              <div className="text-slate-400 pl-2"><Icons.Search /></div>
              <input
                type="text"
                placeholder="Tìm sản phẩm theo tên..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-transparent border-0 outline-none w-full text-sm placeholder:text-slate-400 py-2"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="px-6 py-4">Sản phẩm</th>
                    <th className="px-6 py-4">Chủng loại</th>
                    <th className="px-6 py-4 text-center">ĐVT</th>
                    <th className="px-6 py-4 text-right">Giá bán</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic font-medium">
                        Không tìm thấy sản phẩm nào.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map(product => (
                      <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800">{product.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${product.categoryId ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                            {categories.find(c => c.id === product.categoryId)?.name || 'Chưa phân loại'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center text-slate-500 font-medium">
                          {product.unit}
                        </td>
                        <td className="px-6 py-4 text-right font-black text-emerald-600">
                          {formatCurrency(product.price)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <button
                              onClick={() => { setEditingProduct(product); setIsProductModalOpen(true); }}
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                              <Icons.Edit />
                            </button>
                            <button
                              onClick={() => onDeleteProduct(product.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Icons.Trash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {isProductModalOpen && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          units={units}
          onClose={() => setIsProductModalOpen(false)}
          onSave={(data) => {
            if (editingProduct) onUpdateProduct({ ...editingProduct, ...data } as Product);
            else onAddProduct(data);
            setIsProductModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default ProductManagement;
