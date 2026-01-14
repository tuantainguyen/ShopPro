
import React, { useRef, useState } from 'react';
import { Invoice, SellerProfile } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Icons } from '../constants';

interface Props {
  invoice: Invoice;
  seller: SellerProfile;
  onClose: () => void;
  onPrint: () => void;
}

const InvoicePreview: React.FC<Props> = ({ invoice, seller, onClose, onPrint }) => {
  const subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const tax = (subtotal * invoice.taxRate) / 100;
  const total = subtotal + tax;
  const [isExporting, setIsExporting] = useState(false);
  
  const printAreaRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = async () => {
    if (!printAreaRef.current) return;
    
    setIsExporting(true);
    
    // @ts-ignore - html2pdf được nhúng qua CDN trong index.html
    const html2pdf = window.html2pdf;
    
    const options = {
      margin: [10, 10, 10, 10],
      filename: `${invoice.invoiceNumber}_${invoice.clientName.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      await html2pdf().set(options).from(printAreaRef.current).save();
    } catch (err) {
      console.error("PDF Export Error:", err);
      alert("Đã xảy ra lỗi khi xuất PDF. Vui lòng thử lại hoặc sử dụng chức năng In.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-start overflow-y-auto p-4 md:p-8 no-print custom-scrollbar">
      <div className="flex flex-col md:flex-row justify-between items-center w-full max-w-4xl mb-6 sticky top-0 bg-slate-900/40 p-4 rounded-2xl backdrop-blur-sm z-10 gap-4">
        <div className="text-white text-center md:text-left">
          <h2 className="text-xl font-black uppercase tracking-widest">Xem trước chứng từ</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-tight">Kinh doanh chuyên nghiệp hơn cùng My Shop Pro</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <button 
            onClick={onClose} 
            className="px-5 py-2.5 bg-slate-700 text-white rounded-xl text-sm font-bold hover:bg-slate-600 transition-all flex items-center gap-2"
          >
            Đóng
          </button>
          <button 
            disabled={isExporting}
            onClick={handleExportPDF} 
            className={`px-5 py-2.5 ${isExporting ? 'bg-slate-600' : 'bg-indigo-600 hover:bg-indigo-500'} text-white rounded-xl text-sm font-bold transition-all shadow-xl flex items-center gap-2`}
          >
            {isExporting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : <Icons.Download />}
            {isExporting ? 'Đang tạo...' : 'Lưu PDF'}
          </button>
          <button 
            onClick={onPrint} 
            className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-900/20 flex items-center gap-2"
          >
            <Icons.Printer /> In ngay
          </button>
        </div>
      </div>

      <div 
        ref={printAreaRef}
        className="bg-white w-full max-w-[210mm] min-h-[297mm] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] rounded-sm p-[10mm] md:p-[15mm] animate-in fade-in slide-in-from-bottom-8 duration-500 text-slate-800 flex flex-col"
      >
        {/* Document Header */}
        <div className="flex justify-between border-b-2 border-slate-900 pb-10 mb-10">
          <div className="space-y-1 max-w-[65%]">
            <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 leading-tight">{seller.businessName}</h1>
            <p className="text-sm font-medium text-slate-600">{seller.address}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2">
              {seller.phone && <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider whitespace-nowrap">SĐT: {seller.phone}</p>}
              {seller.email && <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider whitespace-nowrap">Email: {seller.email}</p>}
              {seller.taxCode && <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider whitespace-nowrap">MST: {seller.taxCode}</p>}
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-black text-slate-100 uppercase mb-4 opacity-50 tracking-tighter leading-none">
              {invoice.docType === 'Invoice' ? 'INVOICE' : 'QUOTATION'}
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase text-slate-400">Số chứng từ</p>
              <p className="text-lg font-mono font-bold text-slate-800 leading-none">{invoice.invoiceNumber}</p>
              <p className="text-xs font-bold text-slate-500 mt-2">{formatDate(invoice.date)}</p>
            </div>
          </div>
        </div>

        {/* Client Info */}
        <div className="mb-12">
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4 border-l-4 border-slate-900 pl-3">Thông tin khách hàng</h3>
          <div className="space-y-1 ml-4">
            <p className="text-xl font-black text-slate-900">{invoice.clientName || 'Khách hàng lẻ'}</p>
            {invoice.clientAddress && <p className="text-sm text-slate-500 leading-snug">{invoice.clientAddress}</p>}
            {invoice.clientEmail && <p className="text-xs text-slate-400">{invoice.clientEmail}</p>}
          </div>
        </div>

        {/* Items Table */}
        <div className="flex-grow">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-slate-900">
                <th className="py-4 text-[10px] font-black uppercase text-slate-900 tracking-widest">Diễn giải / Tên hàng</th>
                <th className="py-4 text-[10px] font-black uppercase text-slate-900 tracking-widest text-center">ĐVT</th>
                <th className="py-4 text-[10px] font-black uppercase text-slate-900 tracking-widest text-center">SL</th>
                <th className="py-4 text-[10px] font-black uppercase text-slate-900 tracking-widest text-right">Đơn giá</th>
                <th className="py-4 text-[10px] font-black uppercase text-slate-900 tracking-widest text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items.map((item, idx) => (
                <tr key={item.id}>
                  <td className="py-4">
                    <p className="text-sm font-bold text-slate-800 leading-tight">{item.description || `Sản phẩm #${idx + 1}`}</p>
                  </td>
                  <td className="py-4 text-center text-sm text-slate-500">{item.unit || '-'}</td>
                  <td className="py-4 text-center text-sm font-bold text-slate-800">{item.quantity}</td>
                  <td className="py-4 text-right text-sm text-slate-600 whitespace-nowrap">{formatCurrency(item.price)}</td>
                  <td className="py-4 text-right text-sm font-black text-slate-900 whitespace-nowrap">{formatCurrency(item.quantity * item.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary and Notes */}
        <div className="mt-12 pt-8 border-t border-slate-100">
          <div className="flex flex-col md:flex-row justify-between gap-12">
            <div className="flex-1">
              {invoice.notes && (
                <div className="bg-slate-50 p-6 rounded-2xl border-l-4 border-slate-200">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Ghi chú & Điều khoản</h4>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{invoice.notes}</p>
                </div>
              )}
            </div>
            <div className="w-full md:w-80 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Tạm tính</span>
                <span className="font-bold text-slate-800">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Thuế ({invoice.taxRate}%)</span>
                <span className="font-bold text-slate-800">{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between items-end pt-6 border-t-2 border-slate-900">
                <span className="text-xs font-black uppercase text-slate-400 tracking-[0.2em]">Tổng cộng</span>
                <span className="text-3xl font-black text-slate-900 leading-none">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Signature Area */}
        <div className="mt-16 flex justify-between text-center px-10">
          <div className="w-48">
            <p className="text-xs font-black uppercase text-slate-900 mb-20 tracking-widest">Khách hàng</p>
            <p className="text-[10px] text-slate-400 italic">(Ký, ghi rõ họ tên)</p>
          </div>
          <div className="w-48">
            <p className="text-xs font-black uppercase text-slate-900 mb-20 tracking-widest">Bên xuất hóa đơn</p>
            <p className="text-[10px] text-slate-400 italic">(Ký, đóng dấu)</p>
          </div>
        </div>

        {/* Thank you note */}
        <div className="mt-12 mb-8 text-center">
          <p className="text-lg font-black text-slate-900 tracking-tight italic">Cảm ơn quý khách!</p>
        </div>

        {/* Branding Footer */}
        <div className="mt-auto pt-6 border-t border-slate-50 flex justify-between items-center">
          <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">Tài liệu được khởi tạo từ hệ thống My Shop Pro</p>
          <div className="text-[12px] font-black text-slate-200">MSP</div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;
