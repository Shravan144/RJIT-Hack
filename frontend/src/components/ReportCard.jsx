import { AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from "react-i18next";

const STATUS_BTN = {
  pending:      'hover:border-amber-400 hover:text-amber-400',
  under_review: 'hover:border-blue-400 hover:text-blue-400',
  verified:     'hover:border-green-400 hover:text-green-400',
  dismissed:    'hover:border-brand-muted hover:text-brand-muted',
};

export default function ReportCard({ report, onUpdateStatus }) {
  const { t } = useTranslation();

  const STATUS_CONFIG = {
    pending:      { icon: <Clock size={13} />,         cls: 'bg-amber-400/10 border-amber-400/25 text-amber-400',  label: t('adminDashboard.pending') },
    under_review: { icon: <AlertTriangle size={13} />, cls: 'bg-blue-400/10 border-blue-400/25 text-blue-400',     label: 'Under Review' },
    verified:     { icon: <CheckCircle size={13} />,   cls: 'bg-green-400/10 border-green-400/25 text-green-400', label: t('adminDashboard.verified') },
    dismissed:    { icon: <XCircle size={13} />,       cls: 'bg-brand-elevated border-brand-border text-brand-muted', label: 'Dismissed' },
  };

  const CATEGORY_LABELS = {
    fake_product:    t('reportFiling.catFake'),
    overpricing:     t('reportFiling.catOverprice'),
    unlicensed:      t('reportFiling.catUnlicensed'),
    expired_product: t('reportFiling.catExpired'),
    wrong_advice:    t('reportFiling.catWrongAdvice'),
    other:           t('reportFiling.catOther'),
  };

  const cfg = STATUS_CONFIG[report.status] || STATUS_CONFIG.pending;

  return (
    <div id={`report-card-${report.id}`}
      className="flex flex-col gap-3 bg-brand-elevated border border-brand-subtle rounded-2xl p-4 hover:border-brand-border transition-all">

      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] text-brand-muted">#{report.id}</span>
          <span className="font-bold text-brand-base text-sm">{report.dealer_name}</span>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${cfg.cls}`}>
          {cfg.icon} {cfg.label}
        </div>
      </div>

      <p className="text-xs font-semibold text-brand-muted">
        {CATEGORY_LABELS[report.category] || report.category}
      </p>
      <p className="text-sm text-brand-muted line-clamp-3">{report.description}</p>

      <div className="flex justify-between text-[11px] text-brand-muted">
        <span>{t('components.by')}: {report.reporter_name || t('components.anonymous')}</span>
        <span>{new Date(report.created_at).toLocaleDateString()}</span>
      </div>

      {onUpdateStatus && (
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-brand-subtle">
          {['pending', 'under_review', 'verified', 'dismissed'].map(s => (
            <button key={s} id={`report-${report.id}-status-${s}`}
              onClick={() => onUpdateStatus(report.id, s)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize border transition-all
                ${report.status === s
                  ? 'bg-green-400/20 border-green-400 text-green-400'
                  : `bg-brand-card border-brand-border text-brand-muted ${STATUS_BTN[s]}`}`}>
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
