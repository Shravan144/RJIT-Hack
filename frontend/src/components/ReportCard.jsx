import { AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from "react-i18next";

const STATUS_BTN = {
  pending:      'hover:border-amber-400 hover:bg-amber-50 hover:text-amber-600',
  under_review: 'hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600',
  verified:     'hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-600',
  dismissed:    'hover:border-slate-400 hover:bg-brand-bg hover:text-slate-600',
};

export default function ReportCard({ report, onUpdateStatus }) {
  const { t } = useTranslation();

  const STATUS_CONFIG = {
    pending:      { icon: <Clock size={14} />,         cls: 'bg-amber-50 border-amber-200 text-amber-600',  label: t('adminDashboard.pending') || 'Pending' },
    under_review: { icon: <AlertTriangle size={14} />, cls: 'bg-blue-50 border-blue-200 text-blue-600',     label: 'Under Review' },
    verified:     { icon: <CheckCircle size={14} />,   cls: 'bg-emerald-50 border-emerald-200 text-emerald-600', label: t('adminDashboard.verified') || 'Verified' },
    dismissed:    { icon: <XCircle size={14} />,       cls: 'bg-slate-100 border-brand-border text-brand-muted', label: 'Dismissed' },
  };

  const CATEGORY_LABELS = {
    fake_product:    t('reportFiling.catFake') || 'Fake Product',
    overpricing:     t('reportFiling.catOverprice') || 'Overpricing',
    unlicensed:      t('reportFiling.catUnlicensed') || 'Unlicensed',
    expired_product: t('reportFiling.catExpired') || 'Expired Product',
    wrong_advice:    t('reportFiling.catWrongAdvice') || 'Wrong Advice',
    other:           t('reportFiling.catOther') || 'Other',
  };

  const cfg = STATUS_CONFIG[report.status] || STATUS_CONFIG.pending;

  return (
    <div id={`report-card-${report.id}`}
      className="flex flex-col gap-4 bg-brand-surface border border-brand-border rounded-2xl p-5 hover:border-emerald-200 hover:shadow-md transition-all">

      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">REPORT #{report.id}</span>
          <span className="font-bold text-brand-base text-base">{report.dealer_name}</span>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-md border text-[11px] font-bold uppercase tracking-wide ${cfg.cls}`}>
          {cfg.icon} {cfg.label}
        </div>
      </div>

      <div>
        <span className="inline-block px-2.5 py-1 bg-slate-100 text-brand-base text-[10px] font-bold uppercase tracking-wider rounded-md mb-2">
          {CATEGORY_LABELS[report.category] || report.category}
        </span>
        <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">{report.description}</p>
      </div>

      <div className="flex justify-between items-center text-[11px] font-medium tracking-wide text-brand-muted border-t border-brand-subtle pt-3 mt-1">
        <span className="uppercase">{t('components.by') || 'BY'}: <span className="text-brand-base font-bold">{report.reporter_name || t('components.anonymous') || 'ANONYMOUS'}</span></span>
        <span>{new Date(report.created_at).toLocaleDateString()}</span>
      </div>

      {onUpdateStatus && (
        <div className="flex flex-wrap gap-2 pt-3 border-t border-brand-subtle mt-1">
          {['pending', 'under_review', 'verified', 'dismissed'].map(s => (
            <button key={s} id={`report-${report.id}-status-${s}`}
              onClick={() => onUpdateStatus(report.id, s)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wide uppercase border transition-all
                ${report.status === s
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                  : `bg-brand-surface border-brand-border text-brand-muted ${STATUS_BTN[s]}`}`}>
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
