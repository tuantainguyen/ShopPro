
import React, { useState } from 'react';
import { UserAccount, UserRole } from '../types';
import { Icons } from '../constants';
import { formatDate } from '../utils/formatters';

interface Props {
  users: UserAccount[];
  currentUser: string;
  onAddUser: (user: Partial<UserAccount>) => void;
  onUpdateUser: (user: UserAccount) => void;
  onDeleteUser: (id: string) => void;
}

const UserManagement: React.FC<Props> = ({ users, currentUser, onAddUser, onUpdateUser, onDeleteUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    password: '',
    role: 'Staff' as UserRole
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      onUpdateUser({ ...editingUser, ...formData });
    } else {
      onAddUser(formData);
    }
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ username: '', fullName: '', password: '', role: 'Staff' });
    setEditingUser(null);
  };

  const openEdit = (user: UserAccount) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      fullName: user.fullName,
      password: '',
      role: user.role
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Quản lý Nhân sự</h2>
          <p className="text-slate-500 text-sm">Quản lý tài khoản truy cập và phân quyền nhân viên.</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
        >
          <Icons.Plus /> Thêm tài khoản
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(user => (
          <div key={user.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            <div className={`absolute top-0 right-0 p-4 ${user.role === 'Admin' ? 'text-indigo-600' : 'text-slate-300'}`}>
              {user.role === 'Admin' ? <Icons.Shield /> : <Icons.User />}
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${user.role === 'Admin' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold text-slate-800">{user.fullName}</h4>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{user.role}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Tên đăng nhập:</span>
                <span className="font-mono font-bold text-slate-700">{user.username}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Ngày tạo:</span>
                <span className="font-medium text-slate-700">{formatDate(user.createdAt)}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-50 flex gap-2">
              <button
                onClick={() => openEdit(user)}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-all"
              >
                Chỉnh sửa
              </button>
              {user.username !== currentUser && (
                <button
                  onClick={() => onDeleteUser(user.id)}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-all"
                >
                  Xóa
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                {editingUser ? 'Sửa tài khoản' : 'Thêm tài khoản mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Họ và tên *</label>
                <input
                  required
                  type="text"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm focus:ring-2 ring-indigo-500 outline-none"
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Tên đăng nhập *</label>
                <input
                  required
                  disabled={!!editingUser}
                  type="text"
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm focus:ring-2 ring-indigo-500 outline-none disabled:opacity-50"
                  placeholder="nv-an"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  {editingUser ? 'Mật khẩu mới (Bỏ trống nếu không đổi)' : 'Mật khẩu *'}
                </label>
                <input
                  required={!editingUser}
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm focus:ring-2 ring-indigo-500 outline-none"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Vai trò hệ thống</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'Staff' })}
                    className={`flex-1 py-3 rounded-2xl text-xs font-bold transition-all ${formData.role === 'Staff' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                  >
                    Staff
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'Admin' })}
                    className={`flex-1 py-3 rounded-2xl text-xs font-bold transition-all ${formData.role === 'Admin' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                  >
                    Admin
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-indigo-600 text-white text-sm font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
                >
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
