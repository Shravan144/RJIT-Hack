import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from "react-i18next";

export default function AuthModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', password: '', email: '', role: 'farmer' });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        const userData = await login(form.username, form.password);
        toast.success(t('auth.welcomeBack', { username: form.username }), { duration: 2000, position: 'top-right' });
        onClose();
        navigate(`/${userData?.role || 'farmer'}`);
      } else {
        const userData = await register({ username: form.username, password: form.password, email: form.email, role: form.role });
        toast.success(t('auth.accountCreated'), { duration: 2000, position: 'top-right' });
        onClose();
        navigate(`/${userData?.role || 'farmer'}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || t('auth.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-sm bg-brand-surface border border-brand-border rounded-2xl p-7 shadow-2xl animate-fade-down">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-brand-muted hover:text-brand-base transition-colors"
        >
          <X size={20} />
        </button>

        {/* Tabs */}
        <div className="flex border border-brand-border rounded-lg overflow-hidden mb-5 mt-2">
          {['login', 'register'].map(m => (
            <button key={m} id={`${m}-tab`}
              className={`flex-1 py-2 text-sm font-semibold capitalize transition-all ${mode === m ? 'bg-gradient-primary text-white' : 'text-brand-muted hover:text-brand-base'}`}
              onClick={() => setMode(m)}>{t(`auth.${m}Tab`)}</button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input id="auth-username" type="text" placeholder={t('auth.username')} required
            className="w-full px-3.5 py-2.5 rounded-lg bg-brand-elevated border border-brand-border text-brand-base text-sm outline-none focus:border-green-400 placeholder-brand-muted transition-all"
            value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
          {mode === 'register' && (
            <input id="auth-email" type="email" placeholder={t('auth.email')}
              className="w-full px-3.5 py-2.5 rounded-lg bg-brand-elevated border border-brand-border text-brand-base text-sm outline-none focus:border-green-400 placeholder-brand-muted transition-all"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          )}
          <input id="auth-password" type="password" placeholder={t('auth.password')} required
            className="w-full px-3.5 py-2.5 rounded-lg bg-brand-elevated border border-brand-border text-brand-base text-sm outline-none focus:border-green-400 placeholder-brand-muted transition-all"
            value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          {mode === 'register' && (
            <select id="auth-role"
              className="w-full px-3.5 py-2.5 rounded-lg bg-brand-elevated border border-brand-border text-brand-base text-sm outline-none focus:border-green-400 transition-all cursor-pointer"
              value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
              <option value="farmer">{t('auth.farmer')}</option>
              <option value="dealer">{t('auth.dealer')}</option>
              <option value="inspector">{t('auth.inspector')}</option>
            </select>
          )}
          <button id="auth-submit" type="submit" disabled={loading}
            className="mt-1 py-2.5 rounded-lg bg-gradient-primary text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">
            {loading ? t('auth.pleaseWait') : mode === 'login' ? t('auth.loginTab') : t('auth.createAccount')}
          </button>
        </form>
      </div>
    </div>
  );
}