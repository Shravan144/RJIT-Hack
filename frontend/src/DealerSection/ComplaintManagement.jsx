import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Calendar, CheckCircle, Clock, Eye, MessageSquare, Search, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { getApiMessage } from '../utils/apiMessage';
import PaginationControls from '../components/PaginationControls';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    cls: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: <Clock size={14} className="stroke-2" />,
  },
  under_review: {
    label: 'Under Review',
    cls: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: <Eye size={14} className="stroke-2" />,
  },
  verified: {
    label: 'Verified',
    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: <CheckCircle size={14} className="stroke-2" />,
  },
  dismissed: {
    label: 'Dismissed',
    cls: 'bg-slate-100 text-slate-600 border-brand-border',
    icon: <XCircle size={14} className="stroke-2" />,
  },
};

const CATEGORY_LABEL = {
  fake_product: 'Fake/Adulterated Product',
  overpricing: 'Overpricing',
  unlicensed: 'Unlicensed Operation',
  expired_product: 'Expired Product',
  wrong_advice: 'Wrong Advice',
  other: 'Other',
};

export default function ComplaintManagement() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageMeta, setPageMeta] = useState({ count: 0, next: null, previous: null });

  useEffect(() => {
    fetchComplaints();
  }, [page, search]);

  const fetchComplaints = async () => {
    try {
      const params = {
        page,
        page_size: 10,
        search: search || undefined,
      };
      const { data } = await api.get('/reports/', { params });
      setComplaints(data.results || []);
      setPageMeta({ count: data.count || 0, next: data.next, previous: data.previous });
    } catch (err) {
      toast.error(getApiMessage(err, 'Failed to load complaints'));
    } finally {
      setLoading(false);
    }
  };

  const counts = useMemo(() => {
    const c = { all: 0, pending: 0, under_review: 0, verified: 0, dismissed: 0 };
    complaints.forEach((item) => {
      c.all += 1;
      if (c[item.status] !== undefined) {
        c[item.status] += 1;
      }
    });
    return c;
  }, [complaints]);

  const totalPages = Math.max(1, Math.ceil((pageMeta.count || 0) / 10));

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <h1 className="font-display font-bold text-3xl text-brand-base mb-6 tracking-tight">Complaints on My Account</h1>
        <div className="flex flex-col gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-brand-surface border border-brand-subtle rounded-3xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-brand-base tracking-tight">Complaints on My Account</h1>
          <p className="text-brand-muted font-medium mt-1">View all complaints filed against your dealership and current review status</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { key: 'all', label: 'Total' },
          { key: 'pending', label: 'Pending' },
          { key: 'under_review', label: 'Under Review' },
          { key: 'verified', label: 'Verified' },
          { key: 'dismissed', label: 'Dismissed' },
        ].map((item) => (
          <div key={item.key} className="bg-brand-surface border border-brand-border rounded-2xl p-4">
            <div className="text-xs uppercase tracking-widest font-bold text-brand-muted">{item.label}</div>
            <div className="text-2xl font-bold text-brand-base mt-1">{counts[item.key]}</div>
          </div>
        ))}
      </div>

      <div className="bg-brand-surface border border-brand-border rounded-2xl p-3 mb-5">
        <div className="flex items-center gap-3 bg-brand-bg border border-brand-border rounded-xl px-4 py-2.5">
          <Search size={18} className="text-slate-400" />
          <input
            id="dealer-complaint-search"
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by category, description, or reporter"
            className="flex-1 bg-transparent border-none outline-none text-brand-base placeholder-slate-400"
          />
        </div>
      </div>

      {complaints.length === 0 ? (
        <div className="flex flex-col items-center justify-center bg-brand-surface border border-brand-border rounded-3xl p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-brand-bg flex items-center justify-center text-slate-400 mb-4">
            <MessageSquare size={28} />
          </div>
          <h3 className="font-bold text-brand-base text-xl">No complaints found</h3>
          <p className="text-brand-muted mt-1">No complaints match your current filters.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {complaints.map((complaint) => {
            const statusCfg = STATUS_CONFIG[complaint.status] || STATUS_CONFIG.pending;
            return (
              <div key={complaint.id} className="bg-brand-surface border border-brand-border rounded-3xl p-5 md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-bold text-brand-base">Complaint #{complaint.id}</h3>
                      <span className="px-2.5 py-1 rounded-lg bg-brand-bg border border-brand-border text-xs font-semibold text-brand-base">
                        {CATEGORY_LABEL[complaint.category] || complaint.category}
                      </span>
                    </div>
                    <p className="text-sm text-brand-muted mt-1">
                      Reporter: <span className="font-semibold text-brand-base">{complaint.reporter_name || 'Anonymous'}</span>
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-widest ${statusCfg.cls}`}>
                    {statusCfg.icon}
                    {statusCfg.label}
                  </span>
                </div>

                <div className="mt-4 rounded-2xl border border-brand-border bg-brand-bg p-4">
                  <div className="text-sm text-brand-base whitespace-pre-wrap">{complaint.description}</div>
                </div>

                {complaint.admin_notes && (
                  <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="text-xs uppercase tracking-widest font-bold text-emerald-700 mb-1">Reviewer Notes</div>
                    <div className="text-sm text-emerald-900 whitespace-pre-wrap">{complaint.admin_notes}</div>
                  </div>
                )}

                <div className="mt-3 text-xs text-brand-muted flex items-center gap-2">
                  <Calendar size={13} />
                  Filed on {new Date(complaint.created_at).toLocaleString('en-IN')}
                </div>
              </div>
            );
          })}

          <PaginationControls
            page={page}
            totalPages={totalPages}
            hasPrev={Boolean(pageMeta.previous)}
            hasNext={Boolean(pageMeta.next)}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          />
        </div>
      )}
    </div>
  );
}
