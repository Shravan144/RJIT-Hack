import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  UserCircle, Shield, Mail, Phone, Calendar,
  Globe, Save, CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

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
          <div className="h-8 w-64 rounded-lg skeleton-shimmer mb-6" />
          <div className="h-48 rounded-2xl skeleton-shimmer" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center text-white text-2xl font-black shadow-glow">
          {user?.username?.[0]?.toUpperCase() || 'A'}
        </div>
        <div>
          <h1 className="font-display font-black text-3xl text-brand-base">{user?.username}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Shield size={11} /> Admin
            </span>
            <span className="text-brand-muted text-sm">
              Member since {profile?.date_joined ? new Date(profile.date_joined).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-brand-surface border border-brand-subtle rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-subtle bg-brand-elevated/50">
          <h2 className="font-bold text-brand-base flex items-center gap-2">
            <UserCircle size={18} className="text-green-400" />
            Profile Settings
          </h2>
        </div>

        <form onSubmit={handleSave} className="p-6 flex flex-col gap-5">
          {/* Username (read-only) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-brand-muted">Username</label>
            <div className="px-3.5 py-2.5 rounded-lg bg-brand-elevated border border-brand-border text-brand-muted text-sm">
              {user?.username}
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="admin-email" className="text-sm font-semibold text-brand-muted flex items-center gap-1.5">
              <Mail size={13} /> Email
            </label>
            <input
              id="admin-email"
              type="email"
              className="w-full px-3.5 py-2.5 rounded-lg bg-brand-elevated border border-brand-border text-brand-base text-sm outline-none focus:border-green-400 placeholder-brand-muted transition-all"
              value={form.email}
              onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="admin@agriverify.com"
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="admin-phone" className="text-sm font-semibold text-brand-muted flex items-center gap-1.5">
              <Phone size={13} /> Phone
            </label>
            <input
              id="admin-phone"
              type="tel"
              className="w-full px-3.5 py-2.5 rounded-lg bg-brand-elevated border border-brand-border text-brand-base text-sm outline-none focus:border-green-400 placeholder-brand-muted transition-all"
              value={form.phone}
              onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="+91 12345 67890"
            />
          </div>

          {/* Language */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="admin-language" className="text-sm font-semibold text-brand-muted flex items-center gap-1.5">
              <Globe size={13} /> Preferred Language
            </label>
            <select
              id="admin-language"
              className="w-full px-3.5 py-2.5 rounded-lg bg-brand-elevated border border-brand-border text-brand-base text-sm outline-none focus:border-green-400 cursor-pointer transition-all"
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
            className="self-start flex items-center gap-2 mt-2 px-6 py-2.5 rounded-xl bg-gradient-primary text-white font-semibold text-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {saving ? (
              <>Saving...</>
            ) : (
              <><Save size={15} /> Save Changes</>
            )}
          </button>
        </form>
      </div>

      {/* Quick Info */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-brand-surface border border-brand-subtle rounded-2xl p-5 text-center">
          <Shield size={24} className="mx-auto mb-2 text-amber-400" />
          <div className="font-bold text-brand-base text-sm">Role</div>
          <div className="text-brand-muted text-xs mt-1 uppercase tracking-wider">{profile?.role || 'admin'}</div>
        </div>
        <div className="bg-brand-surface border border-brand-subtle rounded-2xl p-5 text-center">
          <Calendar size={24} className="mx-auto mb-2 text-green-400" />
          <div className="font-bold text-brand-base text-sm">Joined</div>
          <div className="text-brand-muted text-xs mt-1">
            {profile?.date_joined ? new Date(profile.date_joined).toLocaleDateString('en-IN') : '—'}
          </div>
        </div>
        <div className="bg-brand-surface border border-brand-subtle rounded-2xl p-5 text-center">
          <CheckCircle size={24} className="mx-auto mb-2 text-blue-400" />
          <div className="font-bold text-brand-base text-sm">Status</div>
          <div className="text-green-400 text-xs mt-1 font-semibold">Active</div>
        </div>
      </div>
    </div>
  );
}
