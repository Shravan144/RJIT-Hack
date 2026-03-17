import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  AlertTriangle, CheckCircle, XCircle, Clock, Search,
  Eye, Flag, ChevronDown, ChevronUp, MessageSquare,
  Image, User, Calendar, Tag, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_TABS = [
  { key: 'all', label: 'All', icon: <FileText size={15} />, color: 'text-blue-400' },
  { key: 'pending', label: 'Pending', icon: <Clock size={15} />, color: 'text-amber-400' },
  { key: 'under_review', label: 'Under Review', icon: <Eye size={15} />, color: 'text-purple-400' },
  { key: 'verified', label: 'Verified', icon: <CheckCircle size={15} />, color: 'text-green-400' },
  { key: 'dismissed', label: 'Dismissed', icon: <XCircle size={15} />, color: 'text-slate-400' },
];

const STATUS_CONFIG = {
  pending:      { cls: 'bg-amber-400/10 border-amber-400/25 text-amber-400', label: 'Pending', icon: <Clock size={12} /> },
  under_review: { cls: 'bg-purple-400/10 border-purple-400/25 text-purple-400', label: 'Under Review', icon: <Eye size={12} /> },
  verified:     { cls: 'bg-green-400/10 border-green-400/25 text-green-400', label: 'Verified', icon: <CheckCircle size={12} /> },
  dismissed:    { cls: 'bg-slate-400/10 border-slate-400/25 text-slate-400', label: 'Dismissed', icon: <XCircle size={12} /> },
};

const CATEGORY_LABEL = {
  fake_product: 'Fake/Adulterated Product',
  overpricing: 'Overpricing',
  unlicensed: 'Unlicensed Operation',
  expired_product: 'Expired Product',
  wrong_advice: 'Wrong Advice',
  other: 'Other',
};

const CATEGORY_COLOR = {
  fake_product: 'bg-red-400/10 text-red-400 border-red-400/20',
  overpricing: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
  unlicensed: 'bg-purple-400/10 text-purple-400 border-purple-400/20',
  expired_product: 'bg-orange-400/10 text-orange-400 border-orange-400/20',
  wrong_advice: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
  other: 'bg-slate-400/10 text-slate-400 border-slate-400/20',
};

export default function HandleComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [adminNotes, setAdminNotes] = useState({});
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const { data } = await api.get('/reports/');
      setComplaints(data.results || data);
    } catch (err) {
      console.error('Error fetching complaints:', err);
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    setActionLoading(id);
    try {
      await api.patch(`/reports/${id}/update_status/`, {
        status,
        admin_notes: adminNotes[id] || ''
      });
      toast.success(`Complaint marked as ${status}`);
      fetchComplaints();
    } catch (err) {
      toast.error('Failed to update complaint status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleFlagDealer = async (dealerId) => {
    try {
      const { data } = await api.post(`/dealers/${dealerId}/flag/`);
      toast.success(data.detail);
    } catch (err) {
      toast.error('Failed to flag dealer');
    }
  };

  // Filter
  const filtered = complaints.filter(c => {
    const matchSearch = !search ||
      c.dealer_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase()) ||
      c.reporter_name?.toLowerCase().includes(search.toLowerCase());

    if (!matchSearch) return false;
    if (tab === 'all') return true;
    return c.status === tab;
  });

  const tabCounts = {
    all: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    under_review: complaints.filter(c => c.status === 'under_review').length,
    verified: complaints.filter(c => c.status === 'verified').length,
    dismissed: complaints.filter(c => c.status === 'dismissed').length,
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="font-display font-black text-3xl text-brand-base mb-6">Manage Complaints</h1>
        <div className="flex flex-col gap-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-28 rounded-2xl skeleton-shimmer" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white shadow-lg">
              <AlertTriangle size={20} />
            </div>
            <h1 className="font-display font-black text-3xl text-brand-base">Manage Complaints</h1>
          </div>
          <p className="text-brand-muted ml-[52px]">Review, verify, and act on farmer complaints against dealers</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 flex items-center bg-brand-elevated border border-brand-border rounded-xl focus-within:border-green-400 transition-all">
          <Search className="mx-3 text-brand-muted" size={17} />
          <input
            id="complaint-search"
            type="text"
            placeholder="Search by dealer name, reporter, or description..."
            className="flex-1 bg-transparent border-none outline-none text-brand-base text-sm py-3 pr-4 placeholder-brand-muted"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1 border-b border-brand-subtle">
        {STATUS_TABS.map((t) => (
          <button
            key={t.key}
            id={`complaint-tab-${t.key}`}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px whitespace-nowrap transition-all
              ${tab === t.key
                ? `${t.color} border-current`
                : 'text-brand-muted border-transparent hover:text-brand-base'
              }`}
          >
            {t.icon}
            {t.label}
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              tab === t.key ? 'bg-brand-elevated' : 'bg-brand-subtle text-brand-muted'
            }`}>
              {tabCounts[t.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-brand-muted">
          <MessageSquare size={48} className="opacity-30" />
          <p className="text-lg font-medium">No complaints found</p>
          <p className="text-sm">{tab === 'pending' ? 'All complaints have been reviewed!' : 'Try adjusting your filters'}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((complaint) => {
            const sc = STATUS_CONFIG[complaint.status] || STATUS_CONFIG.pending;
            const isExpanded = expandedId === complaint.id;
            const isLoading = actionLoading === complaint.id;
            const catLabel = CATEGORY_LABEL[complaint.category] || complaint.category;
            const catColor = CATEGORY_COLOR[complaint.category] || CATEGORY_COLOR.other;

            return (
              <div key={complaint.id}
                className={`bg-brand-surface border rounded-2xl overflow-hidden transition-all duration-300 ${
                  complaint.status === 'pending'
                    ? 'border-amber-400/20'
                    : complaint.status === 'verified'
                    ? 'border-green-400/20'
                    : 'border-brand-subtle'
                }`}
              >
                {/* Summary Row */}
                <div
                  className="flex flex-wrap items-center gap-4 p-5 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : complaint.id)}
                >
                  {/* Severity Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    complaint.status === 'pending' ? 'bg-amber-400/10 text-amber-400'
                    : complaint.status === 'verified' ? 'bg-green-400/10 text-green-400'
                    : complaint.status === 'under_review' ? 'bg-purple-400/10 text-purple-400'
                    : 'bg-brand-elevated text-brand-muted'
                  }`}>
                    <AlertTriangle size={18} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <h3 className="font-bold text-brand-base text-sm">Complaint #{complaint.id}</h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-bold ${catColor}`}>
                        <Tag size={9} /> {catLabel}
                      </span>
                    </div>
                    <p className="text-brand-muted text-sm truncate">
                      Against <strong className="text-brand-base">{complaint.dealer_name}</strong>
                      {complaint.reporter_name && <> • by {complaint.reporter_name}</>}
                    </p>
                  </div>

                  {/* Status & Date */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold ${sc.cls}`}>
                      {sc.icon} {sc.label}
                    </span>
                    <span className="hidden sm:flex items-center gap-1 text-brand-muted text-xs">
                      <Calendar size={12} />
                      {new Date(complaint.created_at).toLocaleDateString('en-IN')}
                    </span>
                    <div className="text-brand-muted">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="border-t border-brand-subtle bg-brand-elevated/50 p-5 animate-fade-down">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left: Details */}
                      <div className="flex flex-col gap-4">
                        <div>
                          <h4 className="font-semibold text-brand-base text-sm uppercase tracking-wider mb-2">Description</h4>
                          <p className="text-brand-muted text-sm leading-relaxed bg-brand-surface border border-brand-subtle rounded-xl p-4">
                            {complaint.description}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-brand-muted">
                            <User size={14} className="shrink-0" />
                            <span>Reporter: <strong className="text-brand-base">{complaint.reporter_name || 'Anonymous'}</strong></span>
                          </div>
                          <div className="flex items-center gap-2 text-brand-muted">
                            <Calendar size={14} className="shrink-0" />
                            <span>{new Date(complaint.created_at).toLocaleString('en-IN')}</span>
                          </div>
                          {complaint.product_name && (
                            <div className="flex items-center gap-2 text-brand-muted col-span-2">
                              <Tag size={14} className="shrink-0" />
                              <span>Product: <strong className="text-brand-base">{complaint.product_name}</strong></span>
                            </div>
                          )}
                        </div>

                        {complaint.evidence_image && (
                          <div>
                            <h4 className="font-semibold text-brand-base text-sm uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <Image size={14} /> Evidence
                            </h4>
                            <img
                              src={complaint.evidence_image}
                              alt="Evidence"
                              className="max-w-full max-h-64 rounded-xl border border-brand-subtle object-cover"
                            />
                          </div>
                        )}

                        {complaint.admin_notes && (
                          <div className="bg-brand-surface border border-brand-subtle rounded-xl p-3">
                            <h4 className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1">Admin Notes</h4>
                            <p className="text-sm text-brand-base">{complaint.admin_notes}</p>
                          </div>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-col gap-4">
                        <h4 className="font-semibold text-brand-base text-sm uppercase tracking-wider">Admin Actions</h4>

                        {/* Admin Notes */}
                        <div>
                          <label className="text-xs font-medium text-brand-muted mb-1.5 block">Add Notes (optional)</label>
                          <textarea
                            id={`notes-${complaint.id}`}
                            rows={3}
                            placeholder="Add internal notes about this complaint..."
                            className="w-full px-3.5 py-2.5 rounded-lg bg-brand-surface border border-brand-border text-brand-base text-sm outline-none focus:border-green-400 placeholder-brand-muted resize-y transition-all"
                            value={adminNotes[complaint.id] || ''}
                            onChange={(e) => setAdminNotes(prev => ({ ...prev, [complaint.id]: e.target.value }))}
                          />
                        </div>

                        {/* Status Actions */}
                        {complaint.status === 'pending' && (
                          <div className="flex flex-col gap-2">
                            <button
                              id={`review-${complaint.id}`}
                              disabled={isLoading}
                              onClick={() => updateStatus(complaint.id, 'under_review')}
                              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-400 text-sm font-semibold disabled:opacity-50 transition-all"
                            >
                              <Eye size={16} /> Start Review
                            </button>
                            <div className="flex gap-2">
                              <button
                                id={`verify-${complaint.id}`}
                                disabled={isLoading}
                                onClick={() => updateStatus(complaint.id, 'verified')}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 text-sm font-semibold disabled:opacity-50 transition-all"
                              >
                                <CheckCircle size={16} /> Verify
                              </button>
                              <button
                                id={`dismiss-${complaint.id}`}
                                disabled={isLoading}
                                onClick={() => updateStatus(complaint.id, 'dismissed')}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-500/10 hover:bg-slate-500/20 border border-slate-500/20 text-slate-400 text-sm font-semibold disabled:opacity-50 transition-all"
                              >
                                <XCircle size={16} /> Dismiss
                              </button>
                            </div>
                          </div>
                        )}

                        {complaint.status === 'under_review' && (
                          <div className="flex gap-2">
                            <button
                              id={`verify-${complaint.id}`}
                              disabled={isLoading}
                              onClick={() => updateStatus(complaint.id, 'verified')}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 text-sm font-semibold disabled:opacity-50 transition-all"
                            >
                              <CheckCircle size={16} /> Verify Complaint
                            </button>
                            <button
                              id={`dismiss-${complaint.id}`}
                              disabled={isLoading}
                              onClick={() => updateStatus(complaint.id, 'dismissed')}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-500/10 hover:bg-slate-500/20 border border-slate-500/20 text-slate-400 text-sm font-semibold disabled:opacity-50 transition-all"
                            >
                              <XCircle size={16} /> Dismiss
                            </button>
                          </div>
                        )}

                        {complaint.status === 'verified' && (
                          <div className="flex items-start gap-2 px-3 py-3 rounded-xl bg-green-400/5 border border-green-400/15 text-green-400 text-sm">
                            <CheckCircle size={16} className="shrink-0 mt-0.5" />
                            <span>This complaint has been verified. The dealer's trust score has been adjusted.</span>
                          </div>
                        )}

                        {complaint.status === 'dismissed' && (
                          <div className="flex items-start gap-2 px-3 py-3 rounded-xl bg-slate-400/5 border border-slate-400/15 text-slate-400 text-sm">
                            <XCircle size={16} className="shrink-0 mt-0.5" />
                            <span>This complaint has been dismissed.</span>
                          </div>
                        )}

                        {/* Flag Dealer Action */}
                        <div className="border-t border-brand-subtle pt-3 mt-1">
                          <button
                            id={`flag-dealer-${complaint.id}`}
                            onClick={() => handleFlagDealer(complaint.dealer)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm font-semibold transition-all"
                          >
                            <Flag size={16} />
                            Red Flag This Dealer
                          </button>
                          <p className="text-brand-muted text-[11px] mt-2 text-center">
                            Flagging hides the dealer from all farmers immediately
                          </p>
                        </div>
                      </div>
                    </div>
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
