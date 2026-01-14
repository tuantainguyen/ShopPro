
import React, { useState } from 'react';
import { UserAccount } from '../types';

interface Props {
  onLogin: (user: UserAccount) => void;
}

const Login: React.FC<Props> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password || (isRegistering && !fullName)) {
      setError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    const users: UserAccount[] = JSON.parse(localStorage.getItem('mqb_users') || '[]');

    if (isRegistering) {
      if (users.find(u => u.username === username)) {
        setError('Tên đăng nhập đã tồn tại.');
        return;
      }
      // First user is Admin
      const newUser: UserAccount = {
        id: Math.random().toString(36).substr(2, 9),
        username,
        password,
        fullName,
        role: users.length === 0 ? 'Admin' : 'Staff',
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
      localStorage.setItem('mqb_users', JSON.stringify(users));
      setIsRegistering(false);
      alert('Đăng ký thành công! Hãy đăng nhập.');
    } else {
      const user = users.find(u => u.username === username && u.password === password);
      if (user) {
        onLogin(user);
      } else {
        setError('Sai tên đăng nhập hoặc mật khẩu.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-3xl opacity-50"></div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-slate-200 border border-slate-100 p-8 relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-xl shadow-emerald-200 mb-4">
            S
          </div>
          <h1 className="text-2xl font-black text-slate-800">My Shop Pro</h1>
          <p className="text-slate-500 text-sm mt-1">Phần mềm quản lý hóa đơn thông minh</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl text-center">
              {error}
            </div>
          )}
          
          {isRegistering && (
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Họ và tên</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 ring-emerald-500 outline-none transition-all"
                placeholder="Nguyễn Văn A"
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Tên đăng nhập</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 ring-emerald-500 outline-none transition-all"
              placeholder="admin"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 ring-emerald-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 active:scale-[0.98]"
          >
            {isRegistering ? 'Đăng ký tài khoản' : 'Đăng nhập ngay'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500">
            {isRegistering ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="ml-2 text-emerald-600 font-bold hover:underline"
            >
              {isRegistering ? 'Đăng nhập' : 'Tạo tài khoản mới'}
            </button>
          </p>
        </div>
      </div>

      <div className="absolute bottom-8 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
        Powered by Gemini AI Engine
      </div>
    </div>
  );
};

export default Login;
