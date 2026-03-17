import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  CheckCircle, Upload, Edit2, User, FileText, Store, ShieldCheck, Phone, Hash, Calendar,
  Package, MapPin, Camera, Clock, AlertTriangle, XCircle, Save, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getApiMessage } from '../utils/apiMessage';

export default function PrivateDealerProfile() {
  const { user } = useAuth();
  const [dealer, setDealer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: '', shop_name: '', phone: '', address: '',
    license_number: '', specializations: '',
  });

  useEffect(() => {
    fetchDealerProfile();
  }, []);

  const fetchDealerProfile = async () => {
    try {
      const { data } = await api.get('/dealers/me/');
      if (data) {
        setDealer(data);
        setFormData({
          name: data.name || '',
          shop_name: data.shop_name || '',
          phone: data.phone || '',
          address: data.address || '',
          license_number: data.license_number || '',
          specializations: data.specializations || '',
        });
      }
    } catch (err) {
      console.error('Error fetching dealer profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!dealer) return;
    setSaving(true);
    try {
      const { data } = await api.patch('/dealers/me/', formData);
      const updatedDealer = data?.data || data;
      if (updatedDealer) {
        setDealer(prev => ({ ...(prev || {}), ...updatedDealer }));
      }
      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      toast.error(getApiMessage(err, 'Failed to update profile'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-green-500" size={32} />
      </div>
    );
  }

  if (!dealer) {
    return (
      <div className="p-8">
        <div className="bg-amber-400/10 border border-amber-400/25 rounded-2xl p-6 flex items-start gap-4">
          <AlertTriangle className="text-amber-400 shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-bold text-brand-base mb-1">No Dealer Profile Found</h3>
            <p className="text-brand-muted text-sm">Your dealer profile hasn't been created yet. Please contact admin or try re-registering.</p>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = {
    pending: { icon: <Clock size={16} />, label: 'Pending Admin Approval', cls: 'bg-amber-400/10 border-amber-400/25 text-amber-400', desc: 'Your profile is under review. You will be able to add products once approved.' },
    active: { icon: <CheckCircle size={16} />, label: 'Verified & Active', cls: 'bg-green-400/10 border-green-400/25 text-green-400', desc: 'Your profile is approved. Farmers can see you and your products.' },
    suspended: { icon: <XCircle size={16} />, label: 'Suspended', cls: 'bg-red-400/10 border-red-400/25 text-red-400', desc: 'Your account has been suspended. Contact admin for details.' },
    expired: { icon: <AlertTriangle size={16} />, label: 'License Expired', cls: 'bg-amber-400/10 border-amber-400/25 text-amber-400', desc: 'Your license has expired. Please renew and contact admin.' },
  };
  const st = statusConfig[dealer.license_status] || statusConfig.pending;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Status Banner */}
      <div className={`flex items-start gap-3 p-4 rounded-2xl border mb-8 ${st.cls}`}>
        <div className="mt-0.5">{st.icon}</div>
        <div>
          <div className="font-bold text-sm">{st.label}</div>
          <div className="text-xs opacity-80 mt-0.5">{st.desc}</div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center text-white text-2xl font-bold shadow-glow">
            {dealer.shop_name?.[0] || 'D'}
          </div>
          <div>
            <h1 className="font-display font-black text-2xl text-brand-base">{dealer.shop_name}</h1>
            <p className="text-brand-muted text-sm">{dealer.name} • #{dealer.license_number}</p>
          </div>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-brand-border text-brand-muted hover:text-brand-base hover:border-green-400 transition-all text-sm font-medium"
          >
            <Edit2 size={14} /> Edit Profile
          </button>
        )}
      </div>

      {editing ? (
        /* Edit Form */
        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-muted mb-1.5">Dealer Name</label>
              <input type="text" required value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-brand-elevated border border-brand-border rounded-xl px-4 py-3 text-brand-base focus:border-green-500 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-muted mb-1.5">Shop Name</label>
              <input type="text" required value={formData.shop_name}
                onChange={e => setFormData({...formData, shop_name: e.target.value})}
                className="w-full bg-brand-elevated border border-brand-border rounded-xl px-4 py-3 text-brand-base focus:border-green-500 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-muted mb-1.5">Phone</label>
              <input type="tel" required value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full bg-brand-elevated border border-brand-border rounded-xl px-4 py-3 text-brand-base focus:border-green-500 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-muted mb-1.5">License Number</label>
              <input type="text" required value={formData.license_number}
                onChange={e => setFormData({...formData, license_number: e.target.value})}
                className="w-full bg-brand-elevated border border-brand-border rounded-xl px-4 py-3 text-brand-base focus:border-green-500 focus:outline-none transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-brand-muted mb-1.5">Shop Address</label>
              <textarea rows={2} required value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
                className="w-full bg-brand-elevated border border-brand-border rounded-xl px-4 py-3 text-brand-base focus:border-green-500 focus:outline-none transition-all resize-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-brand-muted mb-1.5">Specializations (comma-separated)</label>
              <input type="text" value={formData.specializations}
                onChange={e => setFormData({...formData, specializations: e.target.value})}
                placeholder="Fertilizer, Pesticide, Seeds"
                className="w-full bg-brand-elevated border border-brand-border rounded-xl px-4 py-3 text-brand-base focus:border-green-500 focus:outline-none transition-all"
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setEditing(false)}
              className="px-6 py-2.5 rounded-xl border border-brand-border text-brand-muted hover:text-brand-base transition-all font-medium">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 disabled:opacity-50 transition-all shadow-lg shadow-green-500/20">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        /* View Mode */
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: <User size={18} />, label: 'Dealer Name', value: dealer.name },
              { icon: <Store size={18} />, label: 'Shop Name', value: dealer.shop_name },
              { icon: <Phone size={18} />, label: 'Phone', value: dealer.phone },
              { icon: <Hash size={18} />, label: 'License Number', value: dealer.license_number },
              { icon: <MapPin size={18} />, label: 'Address', value: dealer.address, full: true },
              { icon: <Package size={18} />, label: 'Specializations', value: dealer.specializations || 'Not set', full: true },
            ].map((item, i) => (
              <div key={i} className={`bg-brand-elevated border border-brand-border rounded-xl p-4 flex items-start gap-3 ${item.full ? 'md:col-span-2' : ''}`}>
                <div className="p-2 bg-brand-surface rounded-lg text-green-500">{item.icon}</div>
                <div>
                  <p className="text-xs text-brand-muted font-medium mb-0.5">{item.label}</p>
                  <p className="text-sm text-brand-base font-semibold">{item.value || '-'}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-brand-elevated border border-brand-border rounded-xl p-5 text-center">
              <div className="font-display font-bold text-2xl text-green-400">{dealer.trust_score}</div>
              <div className="text-brand-muted text-xs mt-1">Trust Score</div>
            </div>
            <div className="bg-brand-elevated border border-brand-border rounded-xl p-5 text-center">
              <div className={`font-display font-bold text-2xl ${dealer.total_reports > 0 ? 'text-amber-400' : 'text-brand-base'}`}>
                {dealer.total_reports}
              </div>
              <div className="text-brand-muted text-xs mt-1">Reports Filed</div>
            </div>
            <div className="bg-brand-elevated border border-brand-border rounded-xl p-5 text-center">
              <div className={`font-display font-bold text-2xl ${dealer.is_approved ? 'text-green-400' : 'text-amber-400'}`}>
                {dealer.is_approved ? 'Yes' : 'No'}
              </div>
              <div className="text-brand-muted text-xs mt-1">Visible to Farmers</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
