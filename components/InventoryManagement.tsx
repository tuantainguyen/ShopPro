
import React, { useState, useMemo } from 'react';
import { Product, StockEntry, Invoice } from '../types';
import { Icons, CURRENCY } from '../constants';
import { formatCurrency } from '../utils/formatters';

interface Props {
  products: Product[];
  stockEntries: StockEntry[];
  invoices: Invoice[];
  onAddStock: (entry: Partial<StockEntry>) => void;
}

const InventoryManagement: React.FC<Props> = ({ products, stockEntries, invoices, onAddStock }) => {
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Tính toán tồn kho thực tế cho mỗi sản phẩm
  const inventoryStats = useMemo(() => {
    return products.map(p => {
      // Tổng nhập = Tồn đầu + Lịch sử nhập kho
      const totalIn = p.initialStock + stockEntries
        .filter(entry => entry.productId === p.id)
        .reduce((sum, entry) => sum + entry.quantity, 0);

      // Tổng xuất = Tổng số lượng trong các hóa đơn (giả sử hóa đơn Paid hoặc Draft đều trừ kho)
      const totalOut = invoices.reduce((sum, inv) => {
        const item = inv.items.find(i => i.description === p.name);
        return sum + (item ? item.quantity : 0);
      }, 0);

      const currentStock = totalIn - totalOut;

      return {
        ...p,
        currentStock,
        totalIn,
        totalOut
      };
    });
  }, [products, stockEntries, invoices]);

  const filteredStats = inventoryStats.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStockIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || quantity <= 0) return;

    onAddStock({
      productId: selectedProductId,
      quantity: quantity,
      entryDate: new Date().toISOString()
    });

    setIsEntryModalOpen(false);
    setSelectedProductId('');
    setQuantity(1);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Kho hàng & Tồn kho</h2>
          <p className="text-slate-500 text-sm">Theo dõi lượng hàng hiện có và lịch sử nhập kho.</p>
        </div>
        <button
          onClick={() => setIsEntryModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
        >
          <Icons.Truck /> Nhập hàng mới
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <div className="text-slate-400"><Icons.Search /></div>
          <input
            type="text"
            placeholder="Tìm sản phẩm theo tên..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent border-0 outline-none w-full text-sm placeholder:text-slate-400"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4">Sản phẩm</th>
                <th className="px-6 py-4 text-center">ĐVT</th>
                <th className="px-6 py-4 text-center">Tổng Nhập</th>
                <th className="px-6 py-4 text-center">Đã Xuất</th>
                <th className="px-6 py-4 text-right">Tồn Hiện Tại</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStats.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">Không có dữ liệu tồn kho.</td>
                </tr>
              ) : (
                filteredStats.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">{item.name}</td>
                    <td className="px-6 py-4 text-center text-slate-500">{item.unit}</td>
                    <td className="px-6 py-4 text-center text-slate-600 font-medium">{item.totalIn}</td>
                    <td className="px-6 py-4 text-center text-slate-400">{item.totalOut}</td>
                    <td className="px-6 py-4 text-right font-black text-slate-800">
                      <span className={item.currentStock < 5 ? 'text-red-500' : 'text-emerald-600'}>
                        {item.currentStock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {item.currentStock <= 0 ? (
                        <span className="px-2 py-1 bg-red-100 text-red-600 text-[10px] font-black uppercase rounded">Hết hàng</span>
                      ) : item.currentStock < 5 ? (
                        <span className="px-2 py-1 bg-amber-100 text-amber-600 text-[10px] font-black uppercase rounded">Sắp hết</span>
                      ) : (
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-black uppercase rounded">Sẵn sàng</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isEntryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">Nhập hàng vào kho</h3>
              <button onClick={() => setIsEntryModalOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleStockIn} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Chọn sản phẩm</label>
                <select
                  required
                  value={selectedProductId}
                  onChange={e => setSelectedProductId(e.target.value)}
                  className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 ring-indigo-500 outline-none"
                >
                  <option value="">-- Chọn sản phẩm --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Số lượng nhập</label>
                <input
                  required
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={e => setQuantity(Number(e.target.value))}
                  className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 ring-indigo-500 outline-none font-bold"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEntryModalOpen(false)}
                  className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-shadow shadow-lg shadow-indigo-200"
                >
                  Xác nhận nhập
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;
