import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ReportCard from '../components/ReportCard';
import { Users, AlertTriangle, ShieldCheck, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from "react-i18next";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [tab, setTab] = useState('reports');
  const [fetching, setFetching] = useState(true);
  const [stats, setStats] = useState({ totalDealers: 0, totalReports: 0, pendingReports: 0, verifiedReports: 0 });

  useEffect(() => {
    if (!loading && (!user || (user.role !== 'admin' && !user.is_staff))) {
      navigate('/');
      toast.error(t('adminDashboard.reqAdmin'));
    }
  }, [user, loading]);

  useEffect(() => {
    if (user && (user.role === 'admin' || user.is_staff)) fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setFetching(true);
    try {
      const [rRes, dRes] = await Promise.all([
        api.get('/reports/', { params: { page_size: 50 } }),
        api.get('/dealers/', { params: { page_size: 50 } }),
      ]);
      const r = rRes.data.results || rRes.data;
      const d = dRes.data.results || dRes.data;
      setReports(r); setDealers(d);
      setStats({ totalDealers: d.length, totalReports: r.length, pendingReports: r.filter(x => x.status === 'pending').length, verifiedReports: r.filter(x => x.status === 'verified').length });
    } finally { setFetching(false); }
  };

  const updateReportStatus = async (reportId, status) => {
    try {
      await api.patch(`/reports/${reportId}/update_status/`, { status });
      toast.success(t('adminDashboard.markedAs', { status }));
      fetchAll();
    } catch { toast.error(t('adminDashboard.failedToUpdate')); }
  };

  const statCards = [
    { icon: <Users size={22} />, label: t('adminDashboard.totalDealers'),   value: stats.totalDealers,   color: 'text-blue-400',   bg: 'bg-blue-400/10   border-blue-400/25'   },
    { icon: <FileText size={22}/>, label: t('adminDashboard.totalReports'),  value: stats.totalReports,   color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/25' },
    { icon: <AlertTriangle size={22}/>, label: t('adminDashboard.pending'),   value: stats.pendingReports, color: 'text-amber-400',  bg: 'bg-amber-400/10  border-amber-400/25'  },
    { icon: <ShieldCheck size={22}/>, label: t('adminDashboard.verified'),    value: stats.verifiedReports,color: 'text-green-400',  bg: 'bg-green-400/10  border-green-400/25'  },
  ];

  if (loading || fetching) return <div className="min-h-96 flex items-center justify-center text-slate-500">Loading dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 pb-20">
      <div className="mb-8">
        <h1 className="font-display font-black text-4xl text-slate-100 mb-2">{t('adminDashboard.title')}</h1>
        <p className="text-slate-400">{t('adminDashboard.desc')}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(s => (
          <div key={s.label}
            className={`flex flex-col gap-3 p-5 rounded-2xl border bg-gradient-card ${s.bg} hover:-translate-y-0.5 transition-all`}>
            <div className={s.color}>{s.icon}</div>
            <div className={`font-display font-black text-3xl ${s.color}`}>{s.value}</div>
            <div className="text-slate-500 text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[hsl(220,14%,20%)] mb-6">
        {[
          ['reports', t('adminDashboard.tabReports', { count: reports.length })],
          ['dealers', t('adminDashboard.tabDealers', { count: dealers.length })]
        ].map(([key, label]) => (
          <button key={key} id={`admin-tab-${key}`}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px
              ${tab === key ? 'border-green-400 text-green-400' : 'border-transparent text-slate-500 hover:text-slate-200'}`}
            onClick={() => setTab(key)}>{label}</button>
        ))}
      </div>

      {tab === 'reports' && (
        <div className="flex flex-col gap-3">
          {reports.length === 0
            ? <p className="text-slate-500 text-center py-10">{t('adminDashboard.noReports')}</p>
            : reports.map(r => <ReportCard key={r.id} report={r} onUpdateStatus={updateReportStatus} />)}
        </div>
      )}

      {tab === 'dealers' && (
        <div className="overflow-x-auto rounded-2xl border border-[hsl(220,14%,20%)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[hsl(220,14%,16%)] border-b border-[hsl(220,14%,20%)]">
                {[
                  t('adminDashboard.thShop'),
                  t('adminDashboard.thLicense'),
                  t('adminDashboard.thStatus'),
                  t('adminDashboard.thTrustScore'),
                  t('adminDashboard.thReports')
                ].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] uppercase tracking-widest font-semibold text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dealers.map(d => (
                <tr key={d.id} onClick={() => navigate(`/dealers/${d.id}`)}
                  className="border-b border-[hsl(220,14%,20%)] hover:bg-[hsl(220,14%,16%)] cursor-pointer transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-100">{d.shop_name}</td>
                  <td className="px-4 py-3 text-slate-400">{d.license_number}</td>
                  <td className="px-4 py-3">
                    <span className={`capitalize text-xs font-semibold ${
                      d.license_status === 'active' ? 'text-green-400' :
                      d.license_status === 'suspended' ? 'text-red-400' : 'text-amber-400'}`}>
                      {d.license_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300 font-semibold">{d.trust_score}</td>
                  <td className="px-4 py-3 text-slate-400">{d.total_reports}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
