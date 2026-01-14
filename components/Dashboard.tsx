
import React, { useMemo } from 'react';
import { Invoice } from '../types';
import { formatCurrency } from '../utils/formatters';
import { Icons } from '../constants';

interface Props {
  invoices: Invoice[];
}

const Dashboard: React.FC<Props> = ({ invoices }) => {
  const currentYear = new Date().getFullYear();

  const quarterlyData = useMemo(() => {
    const data = [
      { label: 'Quý 1', months: [0, 1, 2], revenue: 0, profit: 0 },
      { label: 'Quý 2', months: [3, 4, 5], revenue: 0, profit: 0 },
      { label: 'Quý 3', months: [6, 7, 8], revenue: 0, profit: 0 },
      { label: 'Quý 4', months: [9, 10, 11], revenue: 0, profit: 0 },
    ];

    invoices.filter(inv => inv.status === 'Paid' && inv.docType === 'Invoice').forEach(inv => {
      const date = new Date(inv.date);
      if (date.getFullYear() !== currentYear) return;

      const month = date.getMonth();
      const quarter = data.find(q => q.months.includes(month));

      if (quarter) {
        inv.items.forEach(item => {
          const itemRev = item.quantity * item.price;
          const itemCost = item.quantity * (item.costPrice || 0);
          quarter.revenue += itemRev;
          quarter.profit += (itemRev - itemCost);
        });
      }
    });

    return data;
  }, [invoices, currentYear]);

  const stats = useMemo(() => {
    const totalRevenue = quarterlyData.reduce((sum, q) => sum + q.revenue, 0);
    const totalProfit = quarterlyData.reduce((sum, q) => sum + q.profit, 0);
    const margin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    
    return { totalRevenue, totalProfit, margin };
  }, [quarterlyData]);

  const maxVal = Math.max(...quarterlyData.map(q => Math.max(q.revenue, q.profit)), 1);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Dashboard Tài Chính {currentYear}</h2>
        <p className="text-slate-500 text-sm font-medium">Báo cáo doanh thu và lợi nhuận tổng hợp theo quý.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
            <Icons.Bill />
          </div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tổng doanh thu</div>
          <div className="text-3xl font-black text-emerald-600 tracking-tighter">{formatCurrency(stats.totalRevenue)}</div>
          <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-50 w-fit px-2 py-1 rounded-full">
            <span>&uarr; 12%</span> <span className="text-slate-400">vs năm trước</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
            <Icons.Sparkles />
          </div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Lợi nhuận gộp</div>
          <div className="text-3xl font-black text-indigo-600 tracking-tighter">{formatCurrency(stats.totalProfit)}</div>
          <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-indigo-500 bg-indigo-50 w-fit px-2 py-1 rounded-full">
            <span>&uarr; 8.5%</span> <span className="text-slate-400">Hiệu suất tốt</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
            <Icons.Shield />
          </div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tỷ suất lợi nhuận</div>
          <div className="text-3xl font-black text-slate-800 tracking-tighter">{stats.margin.toFixed(1)}%</div>
          <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full transition-all duration-1000" style={{ width: `${stats.margin}%` }}></div>
          </div>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-10 flex items-center gap-2">
          <Icons.Chart /> Biểu đồ so sánh doanh thu & lợi nhuận
        </h3>
        
        <div className="grid grid-cols-4 gap-8 h-80 items-end border-b border-slate-100 pb-2">
          {quarterlyData.map((q, idx) => (
            <div key={idx} className="flex flex-col items-center gap-4 h-full justify-end group">
              <div className="flex gap-1.5 h-full items-end w-full max-w-[80px]">
                {/* Revenue Bar */}
                <div 
                  className="bg-emerald-500 w-1/2 rounded-t-xl transition-all duration-700 delay-100 relative group/bar"
                  style={{ height: `${(q.revenue / maxVal) * 100}%` }}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-10 font-bold">
                    D.Thu: {formatCurrency(q.revenue)}
                  </div>
                </div>
                {/* Profit Bar */}
                <div 
                  className="bg-indigo-600 w-1/2 rounded-t-xl transition-all duration-700 delay-300 relative group/bar"
                  style={{ height: `${(q.profit / maxVal) * 100}%` }}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-10 font-bold">
                    L.Nhuận: {formatCurrency(q.profit)}
                  </div>
                </div>
              </div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter group-hover:text-slate-800 transition-colors">
                {q.label}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 flex justify-center gap-10">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            <span className="text-xs font-bold text-slate-500">Doanh thu</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
            <span className="text-xs font-bold text-slate-500">Lợi nhuận</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
