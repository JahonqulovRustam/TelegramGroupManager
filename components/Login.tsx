
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Key, User, Lock, Loader2 } from 'lucide-react';
import { CRMUser } from '../types';
import { getAllUsers, saveUser } from '../services/dbService';

interface LoginProps {
  onLogin: (user: CRMUser, botToken: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isSetup, setIsSetup] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSetup = async () => {
      const users = await getAllUsers();
      const hasSuperAdmin = users.some(u => u.role === 'SUPERADMIN');
      setIsSetup(!hasSuperAdmin);
      setLoading(false);
    };
    checkSetup();
  }, []);

  const handleAction = async () => {
    setError('');
    if (isSetup) {
      const token = (document.getElementById('setup-token') as HTMLInputElement).value;
      const name = (document.getElementById('setup-name') as HTMLInputElement).value;
      const user = (document.getElementById('setup-user') as HTMLInputElement).value;
      const pass = (document.getElementById('setup-pass') as HTMLInputElement).value;

      if (!token || !name || !user || !pass) return setError('Barcha maydonlarni to\'ldiring');

      const superAdmin: CRMUser = { 
        id: 'super-root', 
        username: user, 
        password: pass, 
        fullName: name, 
        role: 'SUPERADMIN' 
      };
      
      await saveUser(superAdmin);
      localStorage.setItem('crm_bot_token', token);
      localStorage.setItem('crm_current_user', JSON.stringify(superAdmin));
      onLogin(superAdmin, token);
    } else {
      const users = await getAllUsers();
      const user = users.find(u => u.username === username && u.password === password);
      
      if (user) {
        localStorage.setItem('crm_current_user', JSON.stringify(user));
        onLogin(user, localStorage.getItem('crm_bot_token') || '');
      } else {
        setError('Login yoki parol noto\'g\'ri');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b141a] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b141a] flex items-center justify-center p-6 bg-gradient-to-tr from-[#0b141a] via-[#111e29] to-[#0b141a]">
      <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-3xl border border-white/5 p-10 rounded-[3rem] shadow-2xl text-center">
        <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-600/30">
          <ShieldCheck className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-3xl font-black text-white mb-2">{isSetup ? 'Tizimni Sozlash' : 'CRM Kirish'}</h1>
        <p className="text-slate-500 text-sm mb-10">
          {isSetup ? 'Superadmin va Bot tokenini o\'rnating' : 'Xizmat darajasi bo\'yicha kiring'}
        </p>

        {error && <p className="bg-red-500/10 text-red-500 text-[10px] py-3 px-4 rounded-xl mb-6 font-bold border border-red-500/20 uppercase tracking-widest">{error}</p>}

        <div className="space-y-4">
          {isSetup ? (
            <>
              <input id="setup-token" type="password" placeholder="Telegram Bot Token" className="w-full bg-slate-800/50 border border-white/5 rounded-2xl p-5 text-white outline-none focus:border-indigo-500 transition-all text-sm" />
              <input id="setup-name" type="text" placeholder="Superadmin To'liq Ismi" className="w-full bg-slate-800/50 border border-white/5 rounded-2xl p-5 text-white outline-none focus:border-indigo-500 transition-all text-sm" />
              <input id="setup-user" type="text" placeholder="Superadmin Logini" className="w-full bg-slate-800/50 border border-white/5 rounded-2xl p-5 text-white outline-none focus:border-indigo-500 transition-all text-sm" />
              <input id="setup-pass" type="password" placeholder="Superadmin Paroli" className="w-full bg-slate-800/50 border border-white/5 rounded-2xl p-5 text-white outline-none focus:border-indigo-500 transition-all text-sm" />
            </>
          ) : (
            <>
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                <input 
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && handleAction()}
                  type="text" 
                  placeholder="Username / Login" 
                  className="w-full bg-slate-800/50 border border-white/5 rounded-2xl p-5 pl-14 text-white outline-none focus:border-indigo-500 text-sm" 
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                <input 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && handleAction()}
                  type="password" 
                  placeholder="Parol" 
                  className="w-full bg-slate-800/50 border border-white/5 rounded-2xl p-5 pl-14 text-white outline-none focus:border-indigo-500 text-sm" 
                />
              </div>
            </>
          )}
        </div>

        <button onClick={handleAction} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl mt-8 transition-all shadow-xl shadow-indigo-600/20 uppercase tracking-widest active:scale-[0.98]">
          {isSetup ? 'Tizimni Yoqish' : 'Tizimga Kirish'}
        </button>

        {isSetup && (
          <p className="mt-6 text-[9px] text-slate-600 uppercase font-bold leading-relaxed">
            Eslatma: Birinchi marta kirayotganingiz sababli Superadmin hisobini yaratyapsiz.
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
