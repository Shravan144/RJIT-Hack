import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  Users, ShieldCheck, ShieldX, Flag, Clock, Search,
  CheckCircle, XCircle, AlertTriangle, ChevronDown,
  ChevronUp, MapPin, Phone, Eye, EyeOff, Star
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getApiData, getApiMessage } from '../utils/apiMessage';
import PaginationControls from '../components/PaginationControls';

const TABS = [
  { key: 'pending', label: 'Pending Approval', icon: <Clock size={16} />, color: 'text-amber-500', activeCls: 'border-amber-500 text-amber-700 bg-amber-50/50' },
  { key: 'approved', label: 'Approved Dealers', icon: <ShieldCheck size={16} />, color: 'text-emerald-500', activeCls: 'border-emerald-500 text-emerald-700 bg-emerald-50/50' },
  { key: 'flagged', label: 'Red Flagged', icon: <Flag size={16} />, color: 'text-red-500', activeCls: 'border-red-500 text-red-700 bg-red-50/50' },
  { key: 'all', label: 'All Dealers', icon: <Users size={16} />, color: 'text-blue-500', activeCls: 'border-blue-500 text-blue-700 bg-blue-50/50' },
];

const STATUS_BADGE = {
  active:    { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Active' },
  suspended: { cls: 'bg-red-50 text-red-700 border-red-200', label: 'Suspended' },
  expired:   { cls: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Expired' },
  pending:   { cls: 'bg-slate-100 text-slate-600 border-brand-border', label: 'Pending' },
};

export default function HandleDealer() {
  const [dealers, setDealers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageMeta, setPageMeta] = useState({ count: 0, next: null, previous: null });
  const [expandedId, setExpandedId] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchDealers();
  }, [tab, search, page]);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/dealers/admin_stats/');
      setStats(data);
    } catch (err) {
      toast.error(getApiMessage(err, 'Failed to load dealer stats'));
    }
  };

  const fetchDealers = async () => {
    try {
      const params = {
        page,
        page_size: 12,
        search: search || undefined,
      };

      if (tab === 'pending') {
        params.is_approved = false;
        params.is_flagged = false;
      } else if (tab === 'approved') {
        params.is_approved = true;
      } else if (tab === 'flagged') {
        params.is_flagged = true;
      }

      const { data } = await api.get('/dealers/', { params });
      setDealers(data.results || []);
      setPageMeta({ count: data.count || 0, next: data.next, previous: data.previous });
    } catch (err) {
      console.error('Error fetching dealers:', err);
      toast.error(getApiMessage(err, 'Failed to load dealers'));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await api.post(`/dealers/${id}/approve/`);
      toast.success('Dealer approved successfully!');
      fetchStats();
      fetchDealers();
    } catch (err) {
      toast.error(getApiMessage(err, 'Failed to approve dealer'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(id);
    try {
      await api.post(`/dealers/${id}/reject/`);
      toast.success('Dealer rejected');
      fetchStats();
      fetchDealers();
    } catch (err) {
      toast.error(getApiMessage(err, 'Failed to reject dealer'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleFlag = async (id) => {
    setActionLoading(id);
    try {
      const { data } = await api.post(`/dealers/${id}/flag/`);
      const payload = getApiData(data) || {};
      toast.success(data.message || data.detail || 'Dealer flag updated');
      if (payload.is_flagged !== undefined) {
        setDealers(prev => prev.map(d => d.id === id ? {
          ...d,
          is_flagged: payload.is_flagged,
          license_status: payload.is_flagged ? 'suspended' : d.license_status,
        } : d));
      }
      fetchStats();
      fetchDealers();
    } catch (err) {
      toast.error(getApiMessage(err, 'Failed to update flag status'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    setActionLoading(id);
    try {
      await api.patch(`/dealers/${id}/`, { license_status: newStatus });
      toast.success(`Dealer status updated to ${newStatus}`);
      fetchStats();
      fetchDealers();
    } catch (err) {
      toast.error(getApiMessage(err, 'Failed to update dealer status'));
    } finally {
      setActionLoading(null);
    }
  };

  const tabCounts = {
    pending: stats?.dealers?.pending_approval ?? 0,
    approved: stats?.dealers?.approved ?? 0,
    flagged: stats?.dealers?.flagged ?? 0,
    all: stats?.dealers?.total ?? 0,
  };
  const totalPages = Math.max(1, Math.ceil((pageMeta.count || 0) / 12));

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <h1 className="font-display font-bold text-3xl text-brand-base mb-6 tracking-tight">Handle Dealers</h1>
        <div className="flex flex-col gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-brand-surface border border-brand-subtle rounded-3xl animate-pulse shadow-sm" />)}
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
              <Users size={24} className="stroke-2 text-emerald-400" />
            </div>
            <h1 className="font-display font-bold text-3xl md:text-4xl text-brand-base tracking-tight">Handle Dealers</h1>
          </div>
          <p className="text-brand-muted font-medium md:ml-[64px]">Verify, approve, and manage all dealer registrations</p>
        </div>
      </div>

      <div className="bg-brand-surface border border-brand-border rounded-3xl shadow-sm overflow-hidden mb-6 flex flex-col md:flex-row md:items-center justify-between p-2">
         {/* Tabs */}
         <div className="flex gap-1 overflow-x-auto p-2 no-scrollbar">
          {TABS.map((t) => (
            <button
              key={t.key}
              id={`tab-${t.key}`}
              onClick={() => {
                setTab(t.key);
                setPage(1);
              }}
              className={`flex items-center gap-2.5- px-5 py-3 text-sm font-bold rounded-xl whitespace-nowrap transition-all border-b-2
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

        {/* Search Bar */}
        <div className="p-2 w-full md:w-80">
          <div className="flex items-center gap-3 bg-brand-bg border border-brand-border rounded-xl focus-within:border-emerald-500 focus-within:bg-brand-surface focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all px-4 py-2.5">
            <Search className="text-slate-400 shrink-0" size={18} />
            <input
              id="dealer-admin-search"
              type="text"
              placeholder="Search dealers..."
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
      {dealers.length === 0 ? (
        <div className="flex flex-col items-center justify-center bg-brand-surface border border-brand-border rounded-3xl shadow-sm p-20 text-center">
          <div className="w-20 h-20 bg-brand-bg rounded-full flex items-center justify-center text-slate-300 mb-6">
             <Users size={40} />
          </div>
          <h3 className="font-bold text-brand-base text-xl mb-2">No dealers found</h3>
          <p className="text-brand-muted font-medium max-w-sm">
            {tab === 'pending' ? 'Great job! No dealers are currently waiting for approval' :
             tab === 'flagged' ? 'Excellent! No dealers have been red-flagged for violations' :
             'We couldn\'t find any dealers matching your current search parameters.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {dealers.map((dealer) => {
            const sc = STATUS_BADGE[dealer.license_status] || STATUS_BADGE.pending;
            const isExpanded = expandedId === dealer.id;
            const isLoading = actionLoading === dealer.id;

            return (
              <div key={dealer.id}
                className={`bg-brand-surface border rounded-3xl overflow-hidden transition-all duration-300 shadow-sm ${
                  dealer.is_flagged
                    ? 'border-red-200'
                    : !dealer.is_approved
                    ? 'border-amber-200'
                    : 'border-brand-border hover:border-emerald-300'
                }`}
              >
                {/* Main Row */}
                <div
                  className="flex flex-wrap items-center gap-4 p-5 cursor-pointer hover:bg-brand-bg/50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : dealer.id)}
                >
                  {/* Avatar */}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-display font-black shrink-0 shadow-sm ${
                    dealer.is_flagged
                      ? 'bg-red-600'
                      : dealer.is_approved
                      ? 'bg-emerald-600'
                      : 'bg-amber-500'
                  }`}>
                    {dealer.shop_name?.[0] || '?'}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <h3 className="font-bold text-brand-base text-lg truncate tracking-tight">{dealer.shop_name}</h3>
                      {dealer.is_flagged && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-100 border border-red-200 text-red-700 text-xs font-bold uppercase tracking-widest">
                          <Flag size={12} className="stroke-2" /> Flagged
                        </span>
                      )}
                      {!dealer.is_approved && !dealer.is_flagged && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-200 text-amber-700 text-xs font-bold uppercase tracking-widest">
                          <Clock size={12} className="stroke-2" /> Pending
                        </span>
                      )}
                    </div>
                    <p className="text-brand-muted font-medium text-sm truncate flex gap-2">
                       <span className="text-brand-base font-semibold">{dealer.name}</span>
                       <span className="text-slate-300">•</span>
                       <span>License: #{dealer.license_number}</span>
                    </p>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-widest ${sc.cls}`}>
                      {sc.label}
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-brand-bg border border-brand-subtle w-16">
                       <Star size={14} className={dealer.trust_score >= 3 ? 'text-emerald-500 fill-emerald-500/20' : 'text-red-500 fill-red-500/20'} />
                       <span className={`text-sm font-bold ${dealer.trust_score >= 3 ? 'text-emerald-600' : 'text-red-600'}`}>{dealer.trust_score}</span>
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isExpanded ? 'bg-slate-100 text-brand-base' : 'text-slate-400'}`}>
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Panel */}
                {isExpanded && (
                  <div className="border-t border-brand-subtle bg-brand-bg/50 p-6 md:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Details */}
                      <div className="flex flex-col gap-4 md:pr-8 md:border-r md:border-brand-border">
                        <h4 className="font-bold text-brand-base text-sm uppercase tracking-widest flex items-center gap-2">
                           <MapPin size={16} className="text-slate-400" /> Contact Details
                        </h4>
                        
                        <div className="bg-brand-surface border border-brand-border rounded-2xl p-4 shadow-sm text-sm font-medium text-slate-600 flex flex-col gap-3">
                           <div className="flex gap-3">
                             <div className="w-8 h-8 rounded-full bg-brand-bg flex items-center justify-center text-slate-400 shrink-0">
                               <MapPin size={14} />
                             </div>
                             <div className="py-1">{dealer.address}</div>
                           </div>
                           <div className="flex gap-3 items-center">
                             <div className="w-8 h-8 rounded-full bg-brand-bg flex items-center justify-center text-slate-400 shrink-0">
                               <Phone size={14} />
                             </div>
                             <div>{dealer.phone}</div>
                           </div>
                        </div>

                        {/* Stats mini-cards */}
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div className="bg-brand-surface border border-brand-border rounded-2xl p-4 text-center shadow-sm">
                            <div className={`font-display font-bold text-3xl mb-1 ${dealer.total_reports > 0 ? 'text-amber-500' : 'text-brand-base'}`}>
                              {dealer.total_reports}
                            </div>
                            <div className="text-brand-muted font-bold text-[10px] uppercase tracking-widest">Total Reports</div>
                          </div>
                          <div className="bg-brand-surface border border-brand-border rounded-2xl p-4 text-center shadow-sm">
                            <div className="font-display font-bold text-3xl mb-1 text-brand-base">
                              {dealer.is_approved ? <Eye size={28} className="mx-auto text-emerald-500" /> : <EyeOff size={28} className="mx-auto text-slate-300" />}
                            </div>
                            <div className="text-brand-muted font-bold text-[10px] uppercase tracking-widest">{dealer.is_approved ? 'Public Listing' : 'Hidden Listing'}</div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-4">
                        <h4 className="font-bold text-brand-base text-sm uppercase tracking-widest flex items-center gap-2">
                           <ShieldCheck size={16} className="text-slate-400" /> Admin Tools
                        </h4>

                        {/* Approval Actions */}
                        {!dealer.is_approved && !dealer.is_flagged && (
                          <div className="flex flex-col sm:flex-row gap-3">
                            <button
                              id={`approve-${dealer.id}`}
                              disabled={isLoading}
                              onClick={(e) => { e.stopPropagation(); handleApprove(dealer.id); }}
                              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold disabled:opacity-50 transition-all shadow-sm"
                            >
                              <CheckCircle size={18} className="stroke-2" />
                              Approve Registration
                            </button>
                            <button
                              id={`reject-${dealer.id}`}
                              disabled={isLoading}
                              onClick={(e) => { e.stopPropagation(); handleReject(dealer.id); }}
                              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-brand-surface border-2 border-brand-border hover:border-red-200 hover:bg-red-50 text-brand-base hover:text-red-600 font-bold disabled:opacity-50 transition-all shadow-sm"
                            >
                              <XCircle size={18} className="stroke-2" />
                              Reject
                            </button>
                          </div>
                        )}

                        {/* Status toggle */}
                        {dealer.is_approved && (
                          <div className="bg-brand-surface border border-brand-border rounded-2xl p-4 shadow-sm flex flex-col gap-3">
                             <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">License Status</span>
                             <div className="flex flex-col sm:flex-row gap-3">
                                {dealer.license_status !== 'active' && (
                                  <button
                                    disabled={isLoading}
                                    onClick={(e) => { e.stopPropagation(); handleStatusChange(dealer.id, 'active'); }}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 disabled:opacity-50 transition-all"
                                  >
                                    <ShieldCheck size={16} className="stroke-2" /> Activate
                                  </button>
                                )}
                                {dealer.license_status !== 'suspended' && (
                                  <button
                                    disabled={isLoading}
                                    onClick={(e) => { e.stopPropagation(); handleStatusChange(dealer.id, 'suspended'); }}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-50 text-amber-700 font-bold hover:bg-amber-100 disabled:opacity-50 transition-all"
                                  >
                                    <ShieldX size={16} className="stroke-2" /> Suspend
                                  </button>
                                )}
                             </div>
                          </div>
                        )}

                        {/* Flag/Unflag */}
                        <div className={`mt-2 p-4 rounded-2xl border ${dealer.is_flagged ? 'bg-red-50 border-red-200' : 'bg-brand-bg border-brand-border'}`}>
                           <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Safety & Integrity</span>
                           <button
                             id={`flag-${dealer.id}`}
                             disabled={isLoading}
                             onClick={(e) => { e.stopPropagation(); handleFlag(dealer.id); }}
                             className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold disabled:opacity-50 transition-all shadow-sm ${
                               dealer.is_flagged
                                 ? 'bg-brand-surface border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50'
                                 : 'bg-red-600 border border-transparent text-white hover:bg-red-700'
                             }`}
                           >
                             <Flag size={18} className="stroke-2" />
                             {dealer.is_flagged ? 'Revoke Red Flag' : 'Red Flag Dealer'}
                           </button>

                           {/* Warning */}
                           {dealer.total_reports > 3 && !dealer.is_flagged && (
                             <div className="flex items-start gap-3 mt-4 px-4 py-3 rounded-xl bg-red-100 text-red-800 text-sm font-medium border border-red-200">
                               <AlertTriangle size={16} className="shrink-0 mt-0.5 text-red-600" />
                               <span>This dealer has <strong>{dealer.total_reports}</strong> complaints. Manual review and red-flagging is highly recommended.</span>
                             </div>
                           )}
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
               itemLabel="dealers"
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
