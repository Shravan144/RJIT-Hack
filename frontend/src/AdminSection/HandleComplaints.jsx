import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  AlertTriangle, CheckCircle, XCircle, Clock, Search,
  Eye, Flag, ChevronDown, ChevronUp, MessageSquare,
  Image, User, Calendar, Tag, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getApiData, getApiMessage } from '../utils/apiMessage';
import PaginationControls from '../components/PaginationControls';

const STATUS_TABS = [
  { key: 'all', label: 'All', icon: <FileText size={16} />, color: 'text-blue-500', activeCls: 'border-blue-500 text-blue-700 bg-blue-50/50' },
  { key: 'pending', label: 'Pending', icon: <Clock size={16} />, color: 'text-amber-500', activeCls: 'border-amber-500 text-amber-700 bg-amber-50/50' },
  { key: 'under_review', label: 'Under Review', icon: <Eye size={16} />, color: 'text-purple-500', activeCls: 'border-purple-500 text-purple-700 bg-purple-50/50' },
  { key: 'verified', label: 'Verified', icon: <CheckCircle size={16} />, color: 'text-emerald-500', activeCls: 'border-emerald-500 text-emerald-700 bg-emerald-50/50' },
  { key: 'dismissed', label: 'Dismissed', icon: <XCircle size={16} />, color: 'text-brand-muted', activeCls: 'border-slate-500 text-brand-base bg-brand-bg/50' },
];

const STATUS_CONFIG = {
  pending:      { cls: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Pending', icon: <Clock size={14} className="stroke-2" /> },
  under_review: { cls: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Under Review', icon: <Eye size={14} className="stroke-2" /> },
  verified:     { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Verified', icon: <CheckCircle size={14} className="stroke-2" /> },
  dismissed:    { cls: 'bg-slate-100 text-slate-600 border-brand-border', label: 'Dismissed', icon: <XCircle size={14} className="stroke-2" /> },
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
  fake_product: 'bg-red-50 text-red-600 border-red-200',
  overpricing: 'bg-amber-50 text-amber-600 border-amber-200',
  unlicensed: 'bg-purple-50 text-purple-600 border-purple-200',
  expired_product: 'bg-orange-50 text-orange-600 border-orange-200',
  wrong_advice: 'bg-blue-50 text-blue-600 border-blue-200',
  other: 'bg-brand-bg text-slate-600 border-brand-border',
};

export default function HandleComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageMeta, setPageMeta] = useState({ count: 0, next: null, previous: null });
  const [expandedId, setExpandedId] = useState(null);
  const [adminNotes, setAdminNotes] = useState({});
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [tab, search, page]);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/dealers/admin_stats/');
      setStats(data);
    } catch (err) {
      toast.error(getApiMessage(err, 'Failed to load complaint stats'));
    }
  };

  const fetchComplaints = async () => {
    try {
      const params = {
        page,
        page_size: 12,
        search: search || undefined,
      };
      if (tab !== 'all') {
        params.status = tab;
      }

      const { data } = await api.get('/reports/', { params });
      setComplaints(data.results || []);
      setPageMeta({ count: data.count || 0, next: data.next, previous: data.previous });
    } catch (err) {
      console.error('Error fetching complaints:', err);
      toast.error(getApiMessage(err, 'Failed to load complaints'));
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
      fetchStats();
      fetchComplaints();
    } catch (err) {
      toast.error(getApiMessage(err, 'Failed to update complaint status'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleFlagDealer = async (dealerId) => {
    try {
      const { data } = await api.post(`/dealers/${dealerId}/flag/`);
      const payload = getApiData(data) || {};
      toast.success(data.message || data.detail || 'Dealer flag updated');
      if (payload.is_flagged === true) {
        fetchStats();
      }
    } catch (err) {
      toast.error(getApiMessage(err, 'Failed to flag dealer'));
    }
  };

  const tabCounts = {
    all: stats?.reports?.total ?? 0,
    pending: stats?.reports?.pending ?? 0,
    under_review: stats?.reports?.under_review ?? 0,
    verified: stats?.reports?.verified ?? 0,
    dismissed: stats?.reports?.dismissed ?? 0,
  };
  const totalPages = Math.max(1, Math.ceil((pageMeta.count || 0) / 12));

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <h1 className="font-display font-bold text-3xl text-brand-base mb-6 tracking-tight">Manage Complaints</h1>
        <div className="flex flex-col gap-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-28 bg-brand-surface border border-brand-subtle rounded-3xl animate-pulse shadow-sm" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-md">
              <AlertTriangle size={24} className="stroke-2 text-rose-400" />
            </div>
            <h1 className="font-display font-bold text-3xl md:text-4xl text-brand-base tracking-tight">Manage Complaints</h1>
          </div>
          <p className="text-brand-muted font-medium md:ml-[64px]">Review, verify, and act on farmer complaints against dealers</p>
        </div>
      </div>

      <div className="bg-brand-surface border border-brand-border rounded-3xl shadow-sm overflow-hidden mb-6 flex flex-col md:flex-row md:items-center justify-between p-2">
         {/* Tabs */}
         <div className="flex gap-1 overflow-x-auto p-2 no-scrollbar">
          {STATUS_TABS.map((t) => (
            <button
              key={t.key}
              id={`complaint-tab-${t.key}`}
              onClick={() => {
                setTab(t.key);
                setPage(1);
              }}
              className={`flex items-center gap-2.5 px-5 py-3 text-sm font-bold rounded-xl whitespace-nowrap transition-all border-b-2
                ${tab === t.key
                  ? t.activeCls
                  : 'text-brand-muted border-transparent hover:text-brand-base hover:bg-brand-bg'
                }`}
            >
              <span className={t.color}>{t.icon}</span>
              {t.label}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                tab === t.key ? 'bg-brand-surface text-brand-base shadow-sm' : 'bg-slate-100 text-brand-muted'
              }`}>
                {tabCounts[t.key]}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="p-2 w-full md:w-96">
          <div className="flex items-center gap-3 bg-brand-bg border border-brand-border rounded-xl focus-within:border-emerald-500 focus-within:bg-brand-surface focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all px-4 py-2.5">
            <Search className="text-slate-400 shrink-0" size={18} />
            <input
              id="complaint-search"
              type="text"
              placeholder="Search by dealer or description..."
              className="flex-1 bg-transparent border-none outline-none text-brand-base font-medium text-sm placeholder-slate-400"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* Empty State */}
      {complaints.length === 0 ? (
        <div className="flex flex-col items-center justify-center bg-brand-surface border border-brand-border rounded-3xl shadow-sm p-20 text-center">
          <div className="w-20 h-20 bg-brand-bg rounded-full flex items-center justify-center text-slate-300 mb-6">
             <MessageSquare size={40} />
          </div>
          <h3 className="font-bold text-brand-base text-xl mb-2">No complaints found</h3>
          <p className="text-brand-muted font-medium max-w-sm">
            {tab === 'pending' ? 'Excellent! All complaints have been reviewed and processed.' : 'No complaints match your current filters.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {complaints.map((complaint) => {
            const sc = STATUS_CONFIG[complaint.status] || STATUS_CONFIG.pending;
            const isExpanded = expandedId === complaint.id;
            const isLoading = actionLoading === complaint.id;
            const catLabel = CATEGORY_LABEL[complaint.category] || complaint.category;
            const catColor = CATEGORY_COLOR[complaint.category] || CATEGORY_COLOR.other;

            return (
              <div key={complaint.id}
                className={`bg-brand-surface border rounded-3xl overflow-hidden transition-all duration-300 shadow-sm ${
                  complaint.status === 'pending'
                    ? 'border-amber-200'
                    : complaint.status === 'verified'
                    ? 'border-emerald-200'
                    : 'border-brand-border hover:border-emerald-300'
                }`}
              >
                {/* Summary Row */}
                <div
                  className="flex flex-wrap items-center gap-4 p-5 cursor-pointer hover:bg-brand-bg/50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : complaint.id)}
                >
                  {/* Severity Icon */}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                    complaint.status === 'pending' ? 'bg-amber-100 text-amber-600'
                    : complaint.status === 'verified' ? 'bg-emerald-100 text-emerald-600'
                    : complaint.status === 'under_review' ? 'bg-purple-100 text-purple-600'
                    : 'bg-slate-100 text-brand-muted'
                  }`}>
                    <AlertTriangle size={24} className="stroke-2" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-1.5">
                      <h3 className="font-bold text-brand-base text-lg">Complaint #{complaint.id}</h3>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold uppercase tracking-widest ${catColor}`}>
                        <Tag size={12} className="stroke-2" /> {catLabel}
                      </span>
                    </div>
                    <p className="text-brand-muted font-medium text-sm truncate flex gap-2">
                      <span>Against <strong className="text-brand-base">{complaint.dealer_name}</strong></span>
                      {complaint.reporter_name && (
                         <>
                           <span className="text-slate-300">•</span>
                           <span>by {complaint.reporter_name}</span>
                         </>
                      )}
                    </p>
                  </div>

                  {/* Status & Date */}
                  <div className="flex items-center gap-4 shrink-0">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-widest ${sc.cls}`}>
                      {sc.icon} {sc.label}
                    </span>
                    <span className="hidden sm:flex items-center gap-2 text-brand-muted font-bold text-xs uppercase tracking-widest">
                      <Calendar size={14} className="stroke-2" />
                      {new Date(complaint.created_at).toLocaleDateString('en-IN')}
                    </span>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isExpanded ? 'bg-slate-100 text-brand-base' : 'text-slate-400'}`}>
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="border-t border-brand-subtle bg-brand-bg/50 p-6 md:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Left: Details */}
                      <div className="flex flex-col gap-5 md:pr-8 md:border-r md:border-brand-border">
                        <div>
                          <h4 className="font-bold text-brand-base text-sm uppercase tracking-widest flex items-center gap-2 mb-3">
                             <FileText size={16} className="text-slate-400" /> Description
                          </h4>
                          <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 shadow-sm">
                             <p className="text-brand-base font-medium text-sm leading-relaxed whitespace-pre-wrap">
                               {complaint.description}
                             </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm font-medium">
                          <div className="flex items-center gap-2.5 text-brand-muted bg-brand-surface p-3 rounded-xl border border-brand-border shadow-sm">
                            <User size={16} className="shrink-0 text-slate-400" />
                            <span>Reporter: <strong className="text-brand-base">{complaint.reporter_name || 'Anonymous'}</strong></span>
                          </div>
                          <div className="flex items-center gap-2.5 text-brand-muted bg-brand-surface p-3 rounded-xl border border-brand-border shadow-sm">
                            <Calendar size={16} className="shrink-0 text-slate-400" />
                            <span>{new Date(complaint.created_at).toLocaleString('en-IN')}</span>
                          </div>
                          {complaint.product_name && (
                            <div className="flex items-center gap-2.5 text-brand-muted col-span-2 bg-brand-surface p-3 rounded-xl border border-brand-border shadow-sm">
                              <Tag size={16} className="shrink-0 text-slate-400" />
                              <span>Product Details: <strong className="text-brand-base">{complaint.product_name}</strong></span>
                            </div>
                          )}
                        </div>

                        {complaint.evidence_image && (
                          <div>
                            <h4 className="font-bold text-brand-base text-sm uppercase tracking-widest flex items-center gap-2 mb-3">
                              <Image size={16} className="text-slate-400" /> Supporting Evidence
                            </h4>
                            <div className="bg-brand-surface p-2 rounded-2xl border border-brand-border shadow-sm inline-block">
                               <img
                                 src={complaint.evidence_image}
                                 alt="Evidence"
                                 className="max-w-full max-h-64 rounded-xl object-contain bg-slate-100"
                               />
                            </div>
                          </div>
                        )}

                        {complaint.admin_notes && (
                          <div className="bg-slate-100 border border-brand-border rounded-2xl p-4">
                            <h4 className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-2 flex items-center gap-1.5">
                               <MessageSquare size={12} /> Previous Admin Notes
                            </h4>
                            <p className="text-sm font-medium text-slate-800">{complaint.admin_notes}</p>
                          </div>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-col gap-6">
                        <h4 className="font-bold text-brand-base text-sm uppercase tracking-widest flex items-center gap-2">
                           <CheckCircle size={16} className="text-slate-400" /> Resolution Workflow
                        </h4>

                        {/* Admin Notes Box */}
                        <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 shadow-sm">
                          <label className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-2 flex items-center gap-2">
                             <MessageSquare size={14} /> Add Internal Notes
                          </label>
                          <textarea
                            id={`notes-${complaint.id}`}
                            rows={3}
                            placeholder="Add your investigation findings or internal notes here. These won't be visible to the farmer..."
                            className="w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-border text-brand-base text-sm font-medium outline-none focus:border-emerald-500 focus:bg-brand-surface resize-y transition-all placeholder-slate-400"
                            value={adminNotes[complaint.id] || ''}
                            onChange={(e) => setAdminNotes(prev => ({ ...prev, [complaint.id]: e.target.value }))}
                          />
                        </div>

                        {/* Status Actions */}
                        {complaint.status === 'pending' && (
                          <div className="flex flex-col gap-3">
                            <button
                              id={`review-${complaint.id}`}
                              disabled={isLoading}
                              onClick={() => updateStatus(complaint.id, 'under_review')}
                              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold border border-purple-200 disabled:opacity-50 transition-all shadow-sm"
                            >
                              <Eye size={18} className="stroke-2" /> Start Investigation
                            </button>
                            <div className="flex flex-col sm:flex-row gap-3">
                              <button
                                id={`verify-${complaint.id}`}
                                disabled={isLoading}
                                onClick={() => updateStatus(complaint.id, 'verified')}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 border border-transparent text-white font-bold disabled:opacity-50 transition-all shadow-sm"
                              >
                                <CheckCircle size={18} className="stroke-2" /> Mark Verified
                              </button>
                              <button
                                id={`dismiss-${complaint.id}`}
                                disabled={isLoading}
                                onClick={() => updateStatus(complaint.id, 'dismissed')}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-brand-surface border-2 border-brand-border hover:border-slate-300 hover:bg-brand-bg text-slate-600 font-bold disabled:opacity-50 transition-all shadow-sm"
                              >
                                <XCircle size={18} className="stroke-2" /> Dismiss Case
                              </button>
                            </div>
                          </div>
                        )}

                        {complaint.status === 'under_review' && (
                          <div className="flex flex-col sm:flex-row gap-3">
                            <button
                              id={`verify-${complaint.id}`}
                              disabled={isLoading}
                              onClick={() => updateStatus(complaint.id, 'verified')}
                              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 border border-transparent text-white font-bold disabled:opacity-50 transition-all shadow-sm"
                            >
                              <CheckCircle size={18} className="stroke-2" /> Conclude & Verify
                            </button>
                            <button
                              id={`dismiss-${complaint.id}`}
                              disabled={isLoading}
                              onClick={() => updateStatus(complaint.id, 'dismissed')}
                              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand-surface border-2 border-brand-border hover:border-slate-300 hover:bg-brand-bg text-slate-600 font-bold disabled:opacity-50 transition-all shadow-sm"
                            >
                              <XCircle size={18} className="stroke-2" /> Dismiss Case
                            </button>
                          </div>
                        )}

                        {complaint.status === 'verified' && (
                          <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium">
                            <CheckCircle size={18} className="shrink-0 mt-0.5 text-emerald-600 stroke-2" />
                            <span>This complaint has been verified. The dealer's trust score has been dynamically penalized.</span>
                          </div>
                        )}

                        {complaint.status === 'dismissed' && (
                          <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-brand-bg border border-brand-border text-slate-600 text-sm font-medium">
                            <XCircle size={18} className="shrink-0 mt-0.5 text-slate-400 stroke-2" />
                            <span>This complaint lack evidence and has been dismissed.</span>
                          </div>
                        )}

                        {/* Flag Dealer Action */}
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mt-2">
                          <span className="text-xs font-bold text-red-800 uppercase tracking-widest mb-3 block">Escalation Controls</span>
                          <button
                            id={`flag-dealer-${complaint.id}`}
                            onClick={() => handleFlagDealer(complaint.dealer)}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-sm border border-transparent"
                          >
                            <Flag size={18} className="stroke-2" />
                            Red Flag Dealer Account
                          </button>
                          <p className="text-red-700 font-medium text-[11px] mt-3 text-center leading-relaxed">
                            Immediate action: Suspends the dealer's profile and hides them from all farmers. 
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <div className="mt-8 mb-4">
             <PaginationControls
               page={page}
               totalPages={totalPages}
               count={pageMeta.count}
               itemLabel="complaints"
               hasPrevious={!!pageMeta.previous}
               hasNext={!!pageMeta.next}
               onPrevious={() => setPage(p => Math.max(1, p - 1))}
               onNext={() => setPage(p => p + 1)}
             />
          </div>
        </div>
      )}
    </div>
  );
}
