import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  UserCircle, Shield, Mail, Phone, Calendar,
  Globe, Save, CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const inputCls = "w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-border text-brand-base text-sm outline-none focus:border-emerald-500 focus:bg-brand-surface placeholder-slate-400 transition-all";
const labelCls = "text-sm font-bold text-brand-base mb-1.5 flex items-center gap-2";

export default function AdminProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    email: '',
    phone: '',
    preferred_language: 'en',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/users/me/');
      setProfile(data);
      setForm({
        email: data.email || '',
        phone: data.phone || '',
        preferred_language: data.preferred_language || 'en',
      });
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch('/users/me/', form);
      toast.success('Profile updated successfully!');
      fetchProfile();
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-2xl">
          <div className="h-8 w-64 rounded-lg bg-slate-200 animate-pulse mb-6" />
          <div className="h-48 rounded-2xl bg-brand-surface border border-brand-subtle shadow-sm animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-5 mb-10">
        <div className="w-20 h-20 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-3xl font-display font-bold shadow-md">
          {user?.username?.[0]?.toUpperCase() || 'A'}
        </div>
        <div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-brand-base tracking-tight">{user?.username}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-widest">
              <Shield size={12} className="stroke-2" /> Admin
            </span>
            <span className="text-brand-muted text-sm font-medium border-l border-brand-border pl-3">
              Member since {profile?.date_joined ? new Date(profile.date_joined).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-brand-surface border border-brand-border rounded-3xl overflow-hidden shadow-sm shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)]">
        <div className="px-8 py-5 border-b border-brand-subtle bg-brand-bg">
          <h2 className="font-bold text-brand-base flex items-center gap-2.5 text-lg">
            <UserCircle size={20} className="text-emerald-500" />
            Profile Settings
          </h2>
        </div>

        <form onSubmit={handleSave} className="p-8 flex flex-col gap-6">
          {/* Username (read-only) */}
          <div className="flex flex-col">
            <label className={labelCls}>Username</label>
            <div className="px-4 py-3 rounded-xl bg-brand-bg border border-brand-border text-brand-muted text-sm font-medium">
              {user?.username}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div className="flex flex-col">
              <label htmlFor="admin-email" className={labelCls}>
                <Mail size={16} className="text-slate-400" /> Email
              </label>
              <input
                id="admin-email"
                type="email"
                className={inputCls}
                value={form.email}
                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="admin@agriverify.com"
              />
            </div>

            {/* Phone */}
            <div className="flex flex-col">
              <label htmlFor="admin-phone" className={labelCls}>
                <Phone size={16} className="text-slate-400" /> Phone
              </label>
              <input
                id="admin-phone"
                type="tel"
                className={inputCls}
                value={form.phone}
                onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+91 12345 67890"
              />
            </div>
          </div>

          {/* Language */}
          <div className="flex flex-col">
            <label htmlFor="admin-language" className={labelCls}>
              <Globe size={16} className="text-slate-400" /> Preferred Language
            </label>
            <select
              id="admin-language"
              className={`${inputCls} cursor-pointer`}
              value={form.preferred_language}
              onChange={(e) => setForm(f => ({ ...f, preferred_language: e.target.value }))}
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="mr">Marathi</option>
              <option value="pa">Punjabi</option>
            </select>
          </div>

          <button
            id="save-profile-btn"
            type="submit"
            disabled={saving}
            className="self-start flex items-center gap-2 mt-4 px-8 py-3.5 rounded-xl bg-emerald-600 border border-transparent text-white font-bold text-base hover:bg-emerald-700 shadow-sm disabled:opacity-50 transition-all"
          >
            {saving ? (
              <>Saving changes...</>
            ) : (
              <><Save size={18} /> Save Changes</>
            )}
          </button>
        </form>
      </div>

      {/* Quick Info */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-brand-surface border border-brand-border rounded-3xl p-6 text-center shadow-sm">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl mb-3">
             <Shield size={24} className="stroke-2" />
          </div>
          <div className="font-bold text-brand-base mb-1">Role Type</div>
          <div className="text-brand-muted text-xs uppercase font-bold tracking-widest">{profile?.role || 'admin'}</div>
        </div>

        <div className="bg-brand-surface border border-brand-border rounded-3xl p-6 text-center shadow-sm">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 text-blue-600 rounded-xl mb-3">
             <Calendar size={24} className="stroke-2" />
          </div>
          <div className="font-bold text-brand-base mb-1">Date Joined</div>
          <div className="text-brand-muted text-sm font-medium">
            {profile?.date_joined ? new Date(profile.date_joined).toLocaleDateString('en-IN') : '—'}
          </div>
        </div>

        <div className="bg-brand-surface border border-brand-border rounded-3xl p-6 text-center shadow-sm">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-50 text-green-600 rounded-xl mb-3">
             <CheckCircle size={24} className="stroke-2" />
          </div>
          <div className="font-bold text-brand-base mb-1">Status</div>
          <div className="text-emerald-500 text-sm font-bold flex items-center justify-center gap-1.5">
             <div className="w-2 h-2 rounded-full bg-emerald-500" /> Active
          </div>
        </div>
      </div>
    </div>
  );
}
