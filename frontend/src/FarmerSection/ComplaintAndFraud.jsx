import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  AlertTriangle, Send, Search, Clock, CheckCircle, XCircle,
  ChevronDown, ChevronUp, MessageSquare, Loader2, Flag
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'fake_product', label: 'Fake/Adulterated Product' },
  { value: 'overpricing', label: 'Overpricing' },
  { value: 'unlicensed', label: 'Unlicensed Operation' },
  { value: 'expired_product', label: 'Selling Expired Product' },
  { value: 'wrong_advice', label: 'Wrong Agronomic Advice' },
  { value: 'other', label: 'Other' },
];

const STATUS_BADGE = {
  pending: { cls: 'bg-amber-400/10 border-amber-400/25 text-amber-400', icon: <Clock size={12} /> },
  under_review: { cls: 'bg-blue-400/10 border-blue-400/25 text-blue-400', icon: <Search size={12} /> },
  verified: { cls: 'bg-green-400/10 border-green-400/25 text-green-400', icon: <CheckCircle size={12} /> },
  dismissed: { cls: 'bg-red-400/10 border-red-400/25 text-red-400', icon: <XCircle size={12} /> },
};

export default function FarmerComplaintAndFraud() {
  const [dealers, setDealers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const [form, setForm] = useState({
    dealer: '', category: 'fake_product', description: '',
  });

  useEffect(() => {
    Promise.all([
      api.get('/dealers/', { params: { page_size: 200 } }),
      api.get('/reports/'),
    ]).then(([dealerRes, reportRes]) => {
      setDealers(dealerRes.data.results || dealerRes.data);
      setReports(reportRes.data.results || reportRes.data);
    }).catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.dealer || !form.description) {
      toast.error('Please fill all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post('/reports/', form);
      toast.success('Complaint filed successfully!');
      setReports(prev => [data, ...prev]);
      setForm({ dealer: '', category: 'fake_product', description: '' });
      setShowForm(false);
    } catch (err) {
      toast.error('Failed to file complaint');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="font-display font-black text-3xl text-brand-base mb-6">Complaints & Fraud</h1>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-2xl skeleton-shimmer" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white shadow-glow">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h1 className="font-display font-black text-3xl text-brand-base">Complaints & Fraud</h1>
            <p className="text-brand-muted text-sm">Report fraudulent dealers to protect the community</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm font-semibold hover:bg-red-500/20 transition-all">
          <Flag size={15} /> {showForm ? 'Cancel' : 'File Complaint'}
        </button>
      </div>

      {/* New Complaint Form */}
      {showForm && (
        <form onSubmit={handleSubmit}
          className="bg-brand-elevated border border-brand-border rounded-2xl p-6 mb-6 animate-fade-down">
          <h3 className="font-bold text-brand-base mb-4">File a New Complaint</h3>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-muted mb-1.5">Select Dealer *</label>
              <select value={form.dealer} onChange={e => setForm({...form, dealer: e.target.value})} required
                className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-brand-base focus:border-green-500 focus:outline-none transition-all">
                <option value="">Choose a dealer...</option>
                {dealers.map(d => (
                  <option key={d.id} value={d.id}>{d.shop_name} - {d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-muted mb-1.5">Category *</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-brand-base focus:border-green-500 focus:outline-none transition-all">
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-muted mb-1.5">Description *</label>
              <textarea rows={4} required value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                placeholder="Describe the issue in detail..."
                className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-brand-base focus:border-green-500 focus:outline-none transition-all resize-none"
              />
            </div>
            <button type="submit" disabled={submitting}
              className="self-end flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 disabled:opacity-50 transition-all">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Submit Complaint
            </button>
          </div>
        </form>
      )}

      {/* My Complaints List */}
      <h3 className="font-semibold text-brand-base text-sm uppercase tracking-wider mb-4">
        Recent Complaints ({reports.length})
      </h3>

      {reports.length === 0 ? (
        <div className="text-center py-16 text-brand-muted">
          <MessageSquare size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No complaints filed yet</p>
          <p className="text-sm">File a complaint if you encounter any fraudulent dealer</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map(report => {
            const st = STATUS_BADGE[report.status] || STATUS_BADGE.pending;
            const isExpanded = expandedId === report.id;
            const cat = CATEGORIES.find(c => c.value === report.category);
            return (
              <div key={report.id}
                className="bg-brand-surface border border-brand-subtle rounded-xl overflow-hidden hover:border-brand-border transition-all">
                <div className="flex items-center gap-4 p-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : report.id)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="font-semibold text-brand-base text-sm">
                        {report.dealer_name || `Dealer #${report.dealer}`}
                      </h4>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-bold ${st.cls}`}>
                        {st.icon} {report.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-brand-muted text-xs">{cat?.label} • {new Date(report.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-brand-muted">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>
                {isExpanded && (
                  <div className="border-t border-brand-subtle bg-brand-elevated/50 p-4 animate-fade-down text-sm">
                    <p className="text-brand-base mb-3">{report.description}</p>
                    {report.admin_notes && (
                      <div className="bg-blue-400/5 border border-blue-400/15 rounded-lg p-3 mt-2">
                        <div className="text-blue-400 text-xs font-bold mb-1">Admin Notes:</div>
                        <p className="text-brand-muted text-xs">{report.admin_notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
