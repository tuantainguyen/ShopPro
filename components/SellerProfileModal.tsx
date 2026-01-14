
import React, { useState, useRef } from 'react';
import { SellerProfile } from '../types';
import { Icons } from '../constants';

interface Props {
  profile: SellerProfile;
  onSave: (profile: SellerProfile) => void;
  onClose: () => void;
}

const SellerProfileModal: React.FC<Props> = ({ profile, onClose }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'cloud'>('profile');
  const [formData, setFormData] = useState<SellerProfile>(profile);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('mqb_seller_profile', JSON.stringify(formData));
    alert('Đã cập nhật thông tin cửa hàng thành công!');
  };

  const handleOpenSelectKey = async () => {
    try {
      // @ts-ignore
      if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
        await window.aistudio.openSelectKey();
        alert('Đã kết nối với Project Google Cloud. Ứng dụng sẽ sử dụng hạn mức từ tài khoản trả phí của bạn.');
      } else {
        alert('Tính năng này chỉ khả dụng trong môi trường Google AI Studio.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Đã sao chép lệnh: ' + text);
  };

  const handleBackup = () => {
    const data: Record<string, string | null> = {};
    const keys = ['mqb_users', 'mqb_seller_profile', 'mqb_customers', 'mqb_categories', 'mqb_products', 'mqb_stock_entries', 'mqb_all_invoices'];
    keys.forEach(key => { data[key] = localStorage.getItem(key); });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `myshop_pro_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!confirm('CẢNH BÁO: Việc phục hồi sẽ ghi đè lên toàn bộ dữ liệu hiện tại.')) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        Object.entries(data).forEach(([key, value]) => { if (value) localStorage.setItem(key, value as string); });
        window.location.reload();
      } catch (err) { alert('Lỗi: Tập tin không hợp lệ.'); }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col md:flex-row h-[680px]">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-slate-50 border-r border-slate-100 p-6 flex flex-col gap-2">
          <div className="mb-6">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Cài đặt</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Hệ thống My Shop Pro</p>
          </div>
          
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'profile' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <Icons.Store /> Hồ sơ cửa hàng
          </button>
          <button 
            onClick={() => setActiveTab('cloud')}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'cloud' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <Icons.Truck /> Triển khai Firebase
          </button>
          
          <div className="mt-auto pt-6 border-t border-slate-200 space-y-3">
             <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
               <p className="text-[9px] text-blue-700 font-bold leading-tight">Mẹo: Sử dụng Firebase Hosting để có tốc độ truy cập nhanh nhất tại VN.</p>
             </div>
             <button onClick={handleOpenSelectKey} className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
               <Icons.Shield /> Kết nối Paid GCP
             </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-white">
          {activeTab === 'profile' ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Thông tin chi tiết</h4>
                <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Tên cửa hàng *</label>
                  <input required type="text" value={formData.businessName} onChange={e => setFormData({ ...formData, businessName: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm focus:ring-2 ring-indigo-500 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">MST</label>
                    <input type="text" value={formData.taxCode} onChange={e => setFormData({ ...formData, taxCode: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm focus:ring-2 ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Điện thoại *</label>
                    <input required type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm focus:ring-2 ring-indigo-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Địa chỉ *</label>
                  <textarea required value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm focus:ring-2 ring-indigo-500 outline-none resize-none" rows={2} />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex flex-col gap-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dữ liệu & Bảo mật</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={handleBackup} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 text-white text-[10px] font-black uppercase hover:bg-slate-700 transition-all"><Icons.Database /> Sao lưu</button>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase hover:bg-slate-50 transition-all"><Icons.Upload /> Phục hồi</button>
                  <input type="file" ref={fileInputRef} onChange={handleRestore} accept=".json" className="hidden" />
                </div>
                <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 mt-2">Lưu tất cả thay đổi</button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Firebase Deployment Center</h4>
                  <span className="bg-orange-100 text-orange-600 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase">Cloud Hosting</span>
                </div>
                <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
              </div>

              <p className="text-xs text-slate-500 mb-6 leading-relaxed">Theo dõi các bước sau để triển khai ứng dụng của bạn lên hạ tầng của Google (Firebase).</p>

              <div className="space-y-6 pb-10">
                {/* Step 1 */}
                <div className="relative pl-10">
                   <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-black">1</div>
                   <h5 className="text-sm font-bold text-slate-800 mb-2">Cài đặt công cụ (CLI)</h5>
                   <p className="text-xs text-slate-500 mb-3">Mở Terminal/CMD trên máy tính và chạy lệnh cài đặt Firebase Tools toàn cục:</p>
                   <div className="bg-slate-900 rounded-xl p-4 font-mono text-[11px] text-orange-400 relative group">
                      <code>npm install -g firebase-tools</code>
                      <button onClick={() => copyToClipboard('npm install -g firebase-tools')} className="absolute top-2 right-2 p-2 text-slate-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"><Icons.Plus /></button>
                   </div>
                </div>

                {/* Step 2 */}
                <div className="relative pl-10">
                   <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-black">2</div>
                   <h5 className="text-sm font-bold text-slate-800 mb-2">Đăng nhập Firebase</h5>
                   <p className="text-xs text-slate-500 mb-3">Lệnh này sẽ mở trình duyệt để bạn đăng nhập bằng tài khoản Google Cloud của mình:</p>
                   <div className="bg-slate-900 rounded-xl p-4 font-mono text-[11px] text-orange-400 relative group">
                      <code>firebase login</code>
                      <button onClick={() => copyToClipboard('firebase login')} className="absolute top-2 right-2 p-2 text-slate-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"><Icons.Plus /></button>
                   </div>
                </div>

                {/* Step 3 */}
                <div className="relative pl-10">
                   <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-black">3</div>
                   <h5 className="text-sm font-bold text-slate-800 mb-2">Khởi tạo dự án</h5>
                   <p className="text-xs text-slate-500 mb-3">Chạy lệnh sau và chọn **Hosting**. Chọn "Use an existing project" và tìm Project ID của bạn:</p>
                   <div className="bg-slate-900 rounded-xl p-4 font-mono text-[11px] text-orange-400 relative group">
                      <code>firebase init hosting</code>
                      <button onClick={() => copyToClipboard('firebase init hosting')} className="absolute top-2 right-2 p-2 text-slate-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"><Icons.Plus /></button>
                   </div>
                   <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                     <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-tight">Cấu hình quan trọng:</p>
                     <ul className="text-[10px] text-slate-600 list-disc list-inside space-y-0.5">
                       <li>Public directory: <span className="text-orange-600 font-mono">.</span> (dấu chấm)</li>
                       <li>Configure as SPA: <span className="text-orange-600 font-mono">Yes</span></li>
                       <li>Overwrite index.html: <span className="text-orange-600 font-mono">No</span></li>
                     </ul>
                   </div>
                </div>

                {/* Step 4 */}
                <div className="relative pl-10">
                   <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-black">4</div>
                   <h5 className="text-sm font-bold text-slate-800 mb-2">Triển khai (Deploy)</h5>
                   <p className="text-xs text-slate-500 mb-3">Cuối cùng, đẩy toàn bộ code lên Cloud Hosting:</p>
                   <div className="bg-slate-900 rounded-xl p-4 font-mono text-[11px] text-orange-400 relative group">
                      <code>firebase deploy</code>
                      <button onClick={() => copyToClipboard('firebase deploy')} className="absolute top-2 right-2 p-2 text-slate-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"><Icons.Plus /></button>
                   </div>
                </div>

                <div className="pt-8 border-t border-slate-100">
                   <div className="p-6 bg-slate-900 rounded-3xl text-white shadow-xl relative overflow-hidden">
                      <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12 scale-150"><Icons.Bill /></div>
                      <h6 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-4">Mẹo: Tự động hóa với GitHub</h6>
                      <p className="text-[11px] text-slate-300 leading-relaxed mb-4">Bạn có thể thiết lập để mỗi khi bạn `git push` lên GitHub, Firebase sẽ tự động cập nhật web cho bạn. Trong lúc chạy `firebase init`, hãy chọn **"Set up automatic builds and deploys with GitHub"**.</p>
                      <div className="flex gap-2">
                        <button onClick={() => copyToClipboard('git add . && git commit -m "Deploy update" && git push')} className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase transition-all">Copy lệnh Git Push</button>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerProfileModal;
