import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  Users, ShieldCheck, ShieldX, Flag, Clock, Search,
  CheckCircle, XCircle, AlertTriangle, ChevronDown,
  ChevronUp, MapPin, Phone, Eye, EyeOff, Star
} from 'lucide-react';
import toast from 'react-hot-toast';

const TABS = [
  { key: 'pending', label: 'Pending Approval', icon: <Clock size={15} />, color: 'text-amber-400' },
  { key: 'approved', label: 'Approved Dealers', icon: <ShieldCheck size={15} />, color: 'text-green-400' },
  { key: 'flagged', label: 'Red Flagged', icon: <Flag size={15} />, color: 'text-red-400' },
  { key: 'all', label: 'All Dealers', icon: <Users size={15} />, color: 'text-blue-400' },
];

const STATUS_BADGE = {
  active:    { cls: 'bg-green-400/10 border-green-400/25 text-green-400', label: 'Active' },
  suspended: { cls: 'bg-red-400/10 border-red-400/25 text-red-400', label: 'Suspended' },
  expired:   { cls: 'bg-amber-400/10 border-amber-400/25 text-amber-400', label: 'Expired' },
  pending:   { cls: 'bg-brand-elevated border-brand-border text-brand-muted', label: 'Pending' },
};

export default function HandleDealer() {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchDealers();
  }, []);

  const fetchDealers = async () => {
    try {
      const { data } = await api.get('/dealers/', { params: { page_size: 200 } });
      setDealers(data.results || data);
    } catch (err) {
      console.error('Error fetching dealers:', err);
      toast.error('Failed to load dealers');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await api.post(`/dealers/${id}/approve/`);
      toast.success('Dealer approved successfully!');
      fetchDealers();
    } catch (err) {
      toast.error('Failed to approve dealer');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(id);
    try {
      await api.post(`/dealers/${id}/reject/`);
      toast.success('Dealer rejected');
      fetchDealers();
    } catch (err) {
      toast.error('Failed to reject dealer');
    } finally {
      setActionLoading(null);
    }
  };

  const handleFlag = async (id) => {
    setActionLoading(id);
    try {
      const { data } = await api.post(`/dealers/${id}/flag/`);
      toast.success(data.detail);
      fetchDealers();
    } catch (err) {
      toast.error('Failed to update flag status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    setActionLoading(id);
    try {
      await api.patch(`/dealers/${id}/`, { license_status: newStatus });
      toast.success(`Dealer status updated to ${newStatus}`);
      fetchDealers();
    } catch (err) {
      toast.error('Failed to update dealer status');
    } finally {
      setActionLoading(null);
    }
  };

  // Filter dealers based on tab
  const filteredDealers = dealers.filter(d => {
    const matchesSearch = !search || d.shop_name?.toLowerCase().includes(search.toLowerCase()) || d.name?.toLowerCase().includes(search.toLowerCase()) || d.license_number?.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (tab) {
      case 'pending': return !d.is_approved && !d.is_flagged;
      case 'approved': return d.is_approved;
      case 'flagged': return d.is_flagged;
      case 'all': return true;
      default: return true;
    }
  });

  const tabCounts = {
    pending: dealers.filter(d => !d.is_approved && !d.is_flagged).length,
    approved: dealers.filter(d => d.is_approved).length,
    flagged: dealers.filter(d => d.is_flagged).length,
    all: dealers.length,
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="font-display font-black text-3xl text-brand-base mb-6">Handle Dealers</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-48 rounded-2xl skeleton-shimmer" />)}
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
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white shadow-glow">
              <Users size={20} />
            </div>
            <h1 className="font-display font-black text-3xl text-brand-base">Handle Dealers</h1>
          </div>
          <p className="text-brand-muted ml-[52px]">Verify, approve, and manage all dealer registrations</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 flex items-center bg-brand-elevated border border-brand-border rounded-xl focus-within:border-green-400 transition-all">
          <Search className="mx-3 text-brand-muted" size={17} />
          <input
            id="dealer-admin-search"
            type="text"
            placeholder="Search by name, shop, or license number..."
            className="flex-1 bg-transparent border-none outline-none text-brand-base text-sm py-3 pr-4 placeholder-brand-muted"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1 border-b border-brand-subtle">
        {TABS.map((t) => (
          <button
            key={t.key}
            id={`tab-${t.key}`}
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
      {filteredDealers.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-brand-muted">
          <Users size={48} className="opacity-30" />
          <p className="text-lg font-medium">No dealers found</p>
          <p className="text-sm">
            {tab === 'pending' ? 'No dealers are waiting for approval' :
             tab === 'flagged' ? 'No dealers have been red-flagged' :
             'Try adjusting your search or filter'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredDealers.map((dealer) => {
            const sc = STATUS_BADGE[dealer.license_status] || STATUS_BADGE.pending;
            const isExpanded = expandedId === dealer.id;
            const isLoading = actionLoading === dealer.id;

            return (
              <div key={dealer.id}
                className={`bg-brand-surface border rounded-2xl overflow-hidden transition-all duration-300 ${
                  dealer.is_flagged
                    ? 'border-red-400/30 shadow-[0_0_20px_rgba(239,68,68,0.05)]'
                    : !dealer.is_approved
                    ? 'border-amber-400/30'
                    : 'border-brand-subtle hover:border-green-400/30'
                }`}
              >
                {/* Main Row */}
                <div
                  className="flex flex-wrap items-center gap-4 p-5 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : dealer.id)}
                >
                  {/* Avatar */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold shrink-0 ${
                    dealer.is_flagged
                      ? 'bg-gradient-to-br from-red-500 to-rose-600'
                      : dealer.is_approved
                      ? 'bg-gradient-primary'
                      : 'bg-gradient-to-br from-amber-500 to-orange-500'
                  }`}>
                    {dealer.shop_name?.[0] || '?'}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-brand-base text-base truncate">{dealer.shop_name}</h3>
                      {dealer.is_flagged && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-400/10 border border-red-400/25 text-red-400 text-[11px] font-bold uppercase tracking-wider">
                          <Flag size={10} /> Flagged
                        </span>
                      )}
                      {!dealer.is_approved && !dealer.is_flagged && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-400 text-[11px] font-bold uppercase tracking-wider">
                          <Clock size={10} /> Pending
                        </span>
                      )}
                    </div>
                    <p className="text-brand-muted text-sm truncate">{dealer.name} • #{dealer.license_number}</p>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className={`px-2.5 py-1 rounded-lg border text-xs font-semibold ${sc.cls}`}>
                      {sc.label}
                    </div>
                    <div className="flex items-center gap-1 text-sm font-bold">
                      <Star size={14} className={dealer.trust_score >= 3 ? 'text-green-400' : 'text-red-400'} />
                      <span className={dealer.trust_score >= 3 ? 'text-green-400' : 'text-red-400'}>{dealer.trust_score}</span>
                    </div>
                    <div className="text-brand-muted">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Panel */}
                {isExpanded && (
                  <div className="border-t border-brand-subtle bg-brand-elevated/50 p-5 animate-fade-down">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Details */}
                      <div className="flex flex-col gap-3">
                        <h4 className="font-semibold text-brand-base text-sm uppercase tracking-wider">Details</h4>
                        <div className="flex flex-col gap-2 text-sm">
                          <div className="flex items-start gap-2 text-brand-muted">
                            <MapPin size={14} className="shrink-0 mt-0.5" />
                            <span>{dealer.address}</span>
                          </div>
                          <div className="flex items-center gap-2 text-brand-muted">
                            <Phone size={14} className="shrink-0" />
                            <span>{dealer.phone}</span>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3 mt-2">
                          <div className="bg-brand-surface border border-brand-subtle rounded-xl p-3 text-center">
                            <div className="font-display font-bold text-xl text-brand-base">{dealer.trust_score}</div>
                            <div className="text-brand-muted text-[11px]">Trust Score</div>
                          </div>
                          <div className="bg-brand-surface border border-brand-subtle rounded-xl p-3 text-center">
                            <div className={`font-display font-bold text-xl ${dealer.total_reports > 0 ? 'text-amber-400' : 'text-brand-base'}`}>
                              {dealer.total_reports}
                            </div>
                            <div className="text-brand-muted text-[11px]">Reports</div>
                          </div>
                          <div className="bg-brand-surface border border-brand-subtle rounded-xl p-3 text-center">
                            <div className="font-display font-bold text-xl text-brand-base">
                              {dealer.is_approved ? <Eye size={20} className="mx-auto text-green-400" /> : <EyeOff size={20} className="mx-auto text-brand-muted" />}
                            </div>
                            <div className="text-brand-muted text-[11px]">{dealer.is_approved ? 'Visible' : 'Hidden'}</div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-3">
                        <h4 className="font-semibold text-brand-base text-sm uppercase tracking-wider">Admin Actions</h4>

                        {/* Approval Actions */}
                        {!dealer.is_approved && !dealer.is_flagged && (
                          <div className="flex gap-2">
                            <button
                              id={`approve-${dealer.id}`}
                              disabled={isLoading}
                              onClick={(e) => { e.stopPropagation(); handleApprove(dealer.id); }}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 text-sm font-semibold disabled:opacity-50 transition-all"
                            >
                              <CheckCircle size={16} />
                              Approve & Activate
                            </button>
                            <button
                              id={`reject-${dealer.id}`}
                              disabled={isLoading}
                              onClick={(e) => { e.stopPropagation(); handleReject(dealer.id); }}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm font-semibold disabled:opacity-50 transition-all"
                            >
                              <XCircle size={16} />
                              Reject
                            </button>
                          </div>
                        )}

                        {/* Status toggle */}
                        {dealer.is_approved && (
                          <div className="flex gap-2">
                            {dealer.license_status !== 'active' && (
                              <button
                                disabled={isLoading}
                                onClick={(e) => { e.stopPropagation(); handleStatusChange(dealer.id, 'active'); }}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 text-sm font-semibold disabled:opacity-50 transition-all"
                              >
                                <ShieldCheck size={16} />
                                Activate License
                              </button>
                            )}
                            {dealer.license_status !== 'suspended' && (
                              <button
                                disabled={isLoading}
                                onClick={(e) => { e.stopPropagation(); handleStatusChange(dealer.id, 'suspended'); }}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 text-sm font-semibold disabled:opacity-50 transition-all"
                              >
                                <ShieldX size={16} />
                                Suspend License
                              </button>
                            )}
                          </div>
                        )}

                        {/* Flag/Unflag */}
                        <button
                          id={`flag-${dealer.id}`}
                          disabled={isLoading}
                          onClick={(e) => { e.stopPropagation(); handleFlag(dealer.id); }}
                          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold disabled:opacity-50 transition-all ${
                            dealer.is_flagged
                              ? 'bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400'
                              : 'bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400'
                          }`}
                        >
                          <Flag size={16} />
                          {dealer.is_flagged ? 'Remove Red Flag' : 'Red Flag Dealer'}
                        </button>

                        {/* Warning */}
                        {dealer.total_reports > 3 && !dealer.is_flagged && (
                          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-400/5 border border-red-400/15 text-red-400 text-xs">
                            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                            <span>This dealer has <strong>{dealer.total_reports}</strong> complaints. Consider red-flagging to protect farmers.</span>
                          </div>
                        )}
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
