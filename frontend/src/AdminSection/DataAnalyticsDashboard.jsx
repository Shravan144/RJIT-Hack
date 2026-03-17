import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  Users, ShieldCheck, ShieldX, AlertTriangle, Flag,
  Clock, CheckCircle, XCircle, TrendingUp, BarChart3
} from 'lucide-react';

export default function DataAnalyticsDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/dealers/admin_stats/');
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="font-display font-black text-3xl text-brand-base mb-8">Admin Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl skeleton-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  const dealerCards = [
    { label: 'Total Dealers', value: stats?.dealers?.total || 0, icon: <Users size={22} />, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-500/10', text: 'text-blue-400' },
    { label: 'Approved', value: stats?.dealers?.approved || 0, icon: <ShieldCheck size={22} />, color: 'from-green-500 to-emerald-500', bg: 'bg-green-500/10', text: 'text-green-400' },
    { label: 'Pending Approval', value: stats?.dealers?.pending_approval || 0, icon: <Clock size={22} />, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-500/10', text: 'text-amber-400' },
    { label: 'Red Flagged', value: stats?.dealers?.flagged || 0, icon: <Flag size={22} />, color: 'from-red-500 to-rose-600', bg: 'bg-red-500/10', text: 'text-red-400' },
  ];

  const reportCards = [
    { label: 'Total Complaints', value: stats?.reports?.total || 0, icon: <AlertTriangle size={22} />, color: 'from-purple-500 to-violet-600', bg: 'bg-purple-500/10', text: 'text-purple-400' },
    { label: 'Pending Review', value: stats?.reports?.pending || 0, icon: <Clock size={22} />, color: 'from-yellow-500 to-amber-500', bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
    { label: 'Verified', value: stats?.reports?.verified || 0, icon: <CheckCircle size={22} />, color: 'from-green-500 to-teal-500', bg: 'bg-green-500/10', text: 'text-green-400' },
    { label: 'Dismissed', value: stats?.reports?.dismissed || 0, icon: <XCircle size={22} />, color: 'from-slate-500 to-gray-600', bg: 'bg-slate-500/10', text: 'text-slate-400' },
  ];

  return (
    <div className="p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white shadow-glow">
            <BarChart3 size={20} />
          </div>
          <h1 className="font-display font-black text-3xl text-brand-base">Admin Dashboard</h1>
        </div>
        <p className="text-brand-muted ml-[52px]">Overview of dealer verifications and complaint management</p>
      </div>

      {/* Dealer Stats */}
      <div className="mb-8">
        <h2 className="flex items-center gap-2 font-bold text-lg text-brand-base mb-4">
          <TrendingUp size={18} className="text-green-400" /> Dealer Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dealerCards.map((card) => (
            <div key={card.label}
              className="relative overflow-hidden bg-brand-surface border border-brand-subtle rounded-2xl p-5 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300 group">
              {/* Gradient accent */}
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.color} opacity-[0.06] rounded-full -translate-y-6 translate-x-6 group-hover:opacity-[0.12] transition-opacity`} />
              <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${card.bg} ${card.text} mb-3`}>
                {card.icon}
              </div>
              <div className="font-display font-black text-3xl text-brand-base">{card.value}</div>
              <div className="text-brand-muted text-sm mt-1">{card.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Complaint Stats */}
      <div className="mb-8">
        <h2 className="flex items-center gap-2 font-bold text-lg text-brand-base mb-4">
          <AlertTriangle size={18} className="text-amber-400" /> Complaint Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportCards.map((card) => (
            <div key={card.label}
              className="relative overflow-hidden bg-brand-surface border border-brand-subtle rounded-2xl p-5 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300 group">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.color} opacity-[0.06] rounded-full -translate-y-6 translate-x-6 group-hover:opacity-[0.12] transition-opacity`} />
              <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${card.bg} ${card.text} mb-3`}>
                {card.icon}
              </div>
              <div className="font-display font-black text-3xl text-brand-base">{card.value}</div>
              <div className="text-brand-muted text-sm mt-1">{card.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Items */}
      {((stats?.dealers?.pending_approval || 0) > 0 || (stats?.reports?.pending || 0) > 0) && (
        <div className="bg-amber-400/5 border border-amber-400/20 rounded-2xl p-6">
          <h3 className="flex items-center gap-2 font-bold text-amber-400 mb-3">
            <AlertTriangle size={16} /> Action Required
          </h3>
          <div className="flex flex-col gap-2 text-sm">
            {(stats?.dealers?.pending_approval || 0) > 0 && (
              <div className="flex items-center gap-2 text-brand-muted">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-dot-pulse" />
                <span><strong className="text-brand-base">{stats.dealers.pending_approval}</strong> dealer(s) awaiting verification — go to <strong className="text-green-400">Handle Dealers</strong></span>
              </div>
            )}
            {(stats?.reports?.pending || 0) > 0 && (
              <div className="flex items-center gap-2 text-brand-muted">
                <div className="w-2 h-2 rounded-full bg-red-400 animate-dot-pulse" />
                <span><strong className="text-brand-base">{stats.reports.pending}</strong> complaint(s) pending review — go to <strong className="text-green-400">Complaints</strong></span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
