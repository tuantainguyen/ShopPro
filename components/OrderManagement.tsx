
import React, { useState, useMemo } from 'react';
import { Invoice } from '../types';
import { Icons } from '../constants';
import { formatCurrency, formatDate } from '../utils/formatters';

interface Props {
  invoices: Invoice[];
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: Invoice['status']) => void;
  onLoadOrder: (order: Invoice) => void;
  onViewOrder: (order: Invoice) => void;
}

const OrderManagement: React.FC<Props> = ({ invoices, onDelete, onUpdateStatus, onLoadOrder, onViewOrder }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'Invoice' | 'Quotation'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | Invoice['status']>('all');

  const stats = useMemo(() => {
    const paid = invoices
      .filter(inv => inv.docType === 'Invoice' && inv.status === 'Paid')
      .reduce((sum, inv) => sum + inv.items.reduce((s, i) => s + (i.quantity * i.price), 0) * (1 + inv.taxRate / 100), 0);
    
    const pending = invoices
      .filter(inv => inv.docType === 'Invoice' && inv.status !== 'Paid')
      .reduce((sum, inv) => sum + inv.items.reduce((s, i) => s + (i.quantity * i.price), 0) * (1 + inv.taxRate / 100), 0);

    return { paid, pending, totalCount: invoices.length };
  }, [invoices]);

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || inv.docType === filterType;
    const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Quản lý Đơn hàng</h2>
          <p className="text-slate-500 text-sm">Xem lại toàn bộ lịch sử hóa đơn và báo giá đã lập.</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-600 p-5 rounded-2xl text-white shadow-lg shadow-emerald-100">
          <div className="text-[10px] font-bold uppercase opacity-80 mb-1">Đã thu (Hóa đơn Paid)</div>
          <div className="text-2xl font-black">{formatCurrency(stats.paid)}</div>
        </div>
        <div className="bg-amber-500 p-5 rounded-2xl text-white shadow-lg shadow-amber-100">
          <div className="text-[10px] font-bold uppercase opacity-80 mb-1">Công nợ (Hóa đơn Draft/Sent)</div>
          <div className="text-2xl font-black">{formatCurrency(stats.pending)}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Tổng đơn hàng</div>
          <div className="text-2xl font-black text-slate-800">{stats.totalCount}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 bg-slate-50/50">
          <div className="flex-1 flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200">
            <div className="text-slate-400"><Icons.Search /></div>
            <input
              type="text"
              placeholder="Tìm theo mã hoặc tên khách..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-transparent border-0 outline-none w-full text-sm"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={filterType} 
              onChange={e => setFilterType(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium outline-none"
            >
              <option value="all">Tất cả loại</option>
              <option value="Invoice">Hóa đơn</option>
              <option value="Quotation">Báo giá</option>
            </select>
            <select 
              value={filterStatus} 
              onChange={e => setFilterStatus(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium outline-none"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Draft">Nháp</option>
              <option value="Sent">Đã gửi</option>
              <option value="Paid">Đã thanh toán</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4">Mã số</th>
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4 text-center">Loại</th>
                <th className="px-6 py-4 text-right">Tổng cộng</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">Không tìm thấy đơn hàng nào phù hợp.</td>
                </tr>
              ) : (
                filteredInvoices.map(inv => {
                  const total = inv.items.reduce((s, i) => s + (i.quantity * i.price), 0) * (1 + inv.taxRate / 100);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-mono font-bold text-slate-800">{inv.invoiceNumber}</div>
                        <div className="text-[10px] text-slate-400">{formatDate(inv.date)}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-700">{inv.clientName}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${inv.docType === 'Quotation' ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600'}`}>
                          {inv.docType === 'Quotation' ? 'Báo giá' : 'Hóa đơn'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-slate-800">
                        {formatCurrency(total)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <select 
                          value={inv.status}
                          onChange={(e) => onUpdateStatus(inv.id, e.target.value as any)}
                          className={`text-[10px] font-black uppercase px-2 py-1 rounded cursor-pointer outline-none ${
                            inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-600' :
                            inv.status === 'Sent' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          <option value="Draft">Nháp</option>
                          <option value="Sent">Đã gửi</option>
                          <option value="Paid">Đã thanh toán</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={() => onViewOrder(inv)}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                            title="Xem PDF / In"
                          >
                            <Icons.Eye />
                          </button>
                          <button
                            onClick={() => onLoadOrder(inv)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                            title="Sửa đơn"
                          >
                            <Icons.Edit />
                          </button>
                          <button
                            onClick={() => onDelete(inv.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            title="Xóa đơn"
                          >
                            <Icons.Trash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;
