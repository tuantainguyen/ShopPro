
import React, { useState, useMemo } from 'react';
import { Customer, Invoice } from '../types';
import { Icons } from '../constants';
import CustomerModal from './CustomerModal';
import { formatCurrency, formatDate } from '../utils/formatters';

interface Props {
  customers: Customer[];
  invoices: Invoice[];
  onAdd: (c: Partial<Customer>) => void;
  onUpdate: (c: Customer) => void;
  onDelete: (id: string) => void;
}

const CustomerManagement: React.FC<Props> = ({ customers, invoices, onAdd, onUpdate, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewHistoryId, setViewHistoryId] = useState<string | null>(null);

  // Tính toán dữ liệu khách hàng nâng cao
  const customerStats = useMemo(() => {
    return customers.map(customer => {
      // Lọc hóa đơn của khách hàng này (theo tên hoặc email)
      const customerInvoices = invoices.filter(inv => 
        inv.clientName.toLowerCase() === customer.name.toLowerCase() || 
        (inv.clientEmail && customer.email && inv.clientEmail.toLowerCase() === customer.email.toLowerCase())
      );

      const totalSpent = customerInvoices.reduce((sum, inv) => {
        const subtotal = inv.items.reduce((s, item) => s + (item.quantity * item.price), 0);
        return sum + subtotal + (subtotal * inv.taxRate / 100);
      }, 0);

      const lastInvoiceDate = customerInvoices.length > 0 
        ? customerInvoices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date 
        : null;

      // Phân hạng khách hàng
      let rank = { label: 'Đồng', color: 'bg-slate-100 text-slate-600' };
      if (totalSpent > 10000000) rank = { label: 'Kim cương', color: 'bg-indigo-600 text-white shadow-lg' };
      else if (totalSpent > 5000000) rank = { label: 'Vàng', color: 'bg-amber-100 text-amber-600' };
      else if (totalSpent > 1000000) rank = { label: 'Bạc', color: 'bg-blue-100 text-blue-600' };

      return {
        ...customer,
        totalSpent,
        lastInvoiceDate,
        rank,
        invoiceCount: customerInvoices.length
      };
    });
  }, [customers, invoices]);

  const filtered = customerStats.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.phone && c.phone.includes(searchTerm))
  );

  const customerToView = viewHistoryId ? customerStats.find(c => c.id === viewHistoryId) : null;
  const historyInvoices = viewHistoryId ? invoices.filter(inv => 
    inv.clientName.toLowerCase() === (customerToView?.name.toLowerCase())
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Quản lý Khách hàng</h2>
          <p className="text-slate-500 text-sm">Theo dõi chi tiêu, hạng thành viên và lịch sử giao dịch.</p>
        </div>
        <button
          onClick={() => { setEditingCustomer(undefined); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all"
        >
          <Icons.Plus /> Thêm khách hàng mới
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Tổng khách hàng</div>
          <div className="text-2xl font-black text-slate-800">{customers.length}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Khách thân thiết</div>
          <div className="text-2xl font-black text-amber-500">{customerStats.filter(c => c.totalSpent > 1000000).length}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Doanh thu dự kiến</div>
          <div className="text-2xl font-black text-emerald-600">{formatCurrency(customerStats.reduce((s, c) => s + c.totalSpent, 0))}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Lượt giao dịch</div>
          <div className="text-2xl font-black text-indigo-600">{invoices.length}</div>
        </div>
      </div>

      {/* Main List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <div className="text-slate-400"><Icons.Search /></div>
          <input
            type="text"
            placeholder="Tìm theo tên, email hoặc số điện thoại..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent border-0 outline-none w-full text-sm placeholder:text-slate-400"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4">Hạng</th>
                <th className="px-6 py-4 text-center">Đơn hàng</th>
                <th className="px-6 py-4 text-right">Tổng chi tiêu</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                    Chưa có dữ liệu khách hàng.
                  </td>
                </tr>
              ) : (
                filtered.map(customer => (
                  <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${customer.rank.color} rounded-full flex items-center justify-center font-black text-sm`}>
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{customer.name}</div>
                          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">
                            {customer.phone || 'Không có SĐT'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${customer.rank.color}`}>
                        {customer.rank.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm font-bold text-slate-700">{customer.invoiceCount}</div>
                      <div className="text-[10px] text-slate-400">{customer.lastInvoiceDate ? formatDate(customer.lastInvoiceDate) : '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-slate-800">
                      {formatCurrency(customer.totalSpent)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => setViewHistoryId(customer.id)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                          title="Lịch sử giao dịch"
                        >
                          <Icons.Bill />
                        </button>
                        <button
                          onClick={() => { setEditingCustomer(customer); setIsModalOpen(true); }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Sửa thông tin"
                        >
                          <Icons.Edit />
                        </button>
                        <button
                          onClick={() => onDelete(customer.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Xóa"
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

      {/* History Modal */}
      {viewHistoryId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white">
              <div>
                <h3 className="text-xl font-bold">Lịch sử giao dịch</h3>
                <p className="text-xs text-indigo-100 opacity-80">{customerToView?.name}</p>
              </div>
              <button onClick={() => setViewHistoryId(null)} className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors font-bold text-2xl">&times;</button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-6 space-y-3 custom-scrollbar">
              {historyInvoices.length === 0 ? (
                <div className="py-12 text-center text-slate-400 italic">Khách hàng chưa có giao dịch nào.</div>
              ) : (
                historyInvoices.map(inv => (
                  <div key={inv.id} className="flex justify-between items-center p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${inv.docType === 'Quotation' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {inv.docType === 'Quotation' ? <Icons.FileText /> : <Icons.Bill />}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800">{inv.invoiceNumber}</div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">{formatDate(inv.date)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-slate-900">
                        {formatCurrency(inv.items.reduce((s, i) => s + (i.quantity * i.price), 0) * (1 + inv.taxRate / 100))}
                      </div>
                      <div className={`text-[9px] font-bold uppercase ${inv.status === 'Paid' ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {inv.status === 'Paid' ? 'Đã thanh toán' : 'Chờ xử lý'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-6 bg-slate-50 flex justify-between items-center">
               <div className="text-xs text-slate-400 font-bold uppercase">Tổng chi tiêu tích lũy</div>
               <div className="text-xl font-black text-indigo-600">{formatCurrency(customerToView?.totalSpent || 0)}</div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <CustomerModal
          customer={editingCustomer}
          onClose={() => setIsModalOpen(false)}
          onSave={(data) => {
            if (editingCustomer) onUpdate({ ...editingCustomer, ...data } as Customer);
            else onAdd(data);
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default CustomerManagement;
