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
      <div className="p-4 md:p-8 max-w-7xl">
        <h1 className="font-display font-bold text-3xl text-brand-base mb-8 tracking-tight">Admin Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-40 rounded-3xl bg-brand-surface border border-brand-subtle shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const dealerCards = [
    { label: 'Total Dealers', value: stats?.dealers?.total || 0, icon: <Users size={22} className="stroke-2" />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Approved', value: stats?.dealers?.approved || 0, icon: <ShieldCheck size={22} className="stroke-2" />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pending Approval', value: stats?.dealers?.pending_approval || 0, icon: <Clock size={22} className="stroke-2" />, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Red Flagged', value: stats?.dealers?.flagged || 0, icon: <Flag size={22} className="stroke-2" />, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  const reportCards = [
    { label: 'Total Complaints', value: stats?.reports?.total || 0, icon: <AlertTriangle size={22} className="stroke-2" />, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Pending Review', value: stats?.reports?.pending || 0, icon: <Clock size={22} className="stroke-2" />, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Verified', value: stats?.reports?.verified || 0, icon: <CheckCircle size={22} className="stroke-2" />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Dismissed', value: stats?.reports?.dismissed || 0, icon: <XCircle size={22} className="stroke-2" />, color: 'text-slate-600', bg: 'bg-slate-100' },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-md">
            <BarChart3 size={24} className="stroke-2 text-emerald-400" />
          </div>
          <div>
            <h1 className="font-display font-bold text-3xl md:text-4xl text-brand-base tracking-tight">Admin Dashboard</h1>
            <p className="text-brand-muted font-medium mt-1">Overview of dealer verifications and complaint management</p>
          </div>
        </div>
      </div>

      {/* Action Items */}
      {((stats?.dealers?.pending_approval || 0) > 0 || (stats?.reports?.pending || 0) > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 md:p-8 mb-10 shadow-sm flex flex-col md:flex-row gap-6 md:items-center">
          <div className="flex items-center gap-4 shrink-0">
             <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
               <AlertTriangle size={24} className="stroke-2" />
             </div>
             <div>
               <h3 className="font-bold text-amber-900 text-lg">Action Required</h3>
               <p className="text-amber-700 text-sm">You have pending items to review.</p>
             </div>
          </div>
          
          <div className="flex flex-col gap-3 text-sm flex-1 md:pl-8 md:border-l md:border-amber-200/50">
            {(stats?.dealers?.pending_approval || 0) > 0 && (
              <div className="flex items-center gap-3 text-slate-600 bg-brand-surface/60 p-3 rounded-xl">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)] shrink-0" />
                <span><strong className="text-brand-base">{stats.dealers.pending_approval}</strong> dealer(s) awaiting verification — go to <strong className="text-emerald-600">Handle Dealers</strong></span>
              </div>
            )}
            {(stats?.reports?.pending || 0) > 0 && (
              <div className="flex items-center gap-3 text-slate-600 bg-brand-surface/60 p-3 rounded-xl">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)] shrink-0" />
                <span><strong className="text-brand-base">{stats.reports.pending}</strong> complaint(s) pending review — go to <strong className="text-emerald-600">Complaints</strong></span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dealer Stats */}
      <div className="mb-10">
        <h2 className="flex items-center gap-2.5 font-bold text-xl text-brand-base mb-6">
          <TrendingUp size={20} className="text-emerald-500" /> Dealer Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dealerCards.map((card) => (
            <div key={card.label}
              className="bg-brand-surface border border-brand-border rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-300 flex flex-col items-start gap-4">
              <div className={`flex items-center justify-center w-12 h-12 rounded-2xl ${card.bg} ${card.color}`}>
                {card.icon}
              </div>
              <div>
                <div className="font-display font-bold text-4xl text-brand-base tracking-tight">{card.value}</div>
                <div className="text-brand-muted font-medium text-sm mt-1 uppercase tracking-wider">{card.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Complaint Stats */}
      <div className="mb-4">
        <h2 className="flex items-center gap-2.5 font-bold text-xl text-brand-base mb-6">
          <AlertTriangle size={20} className="text-amber-500" /> Complaint Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reportCards.map((card) => (
            <div key={card.label}
              className="bg-brand-surface border border-brand-border rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-300 flex flex-col items-start gap-4">
              <div className={`flex items-center justify-center w-12 h-12 rounded-2xl ${card.bg} ${card.color}`}>
                {card.icon}
              </div>
              <div>
                <div className="font-display font-bold text-4xl text-brand-base tracking-tight">{card.value}</div>
                <div className="text-brand-muted font-medium text-sm mt-1 uppercase tracking-wider">{card.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
