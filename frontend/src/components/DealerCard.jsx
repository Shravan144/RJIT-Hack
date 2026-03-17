import { Link } from 'react-router-dom';
import { MapPin, Phone, ShieldCheck, ShieldX, Clock } from 'lucide-react';
import TrustScoreBadge from './TrustScoreBadge';
import { useTranslation } from "react-i18next";

export default function DealerCard({ dealer }) {
  const { t } = useTranslation();

  const STATUS = {
    active:    { icon: <ShieldCheck size={14} />, color: 'text-emerald-600 bg-emerald-50 border-emerald-200', label: t('dealerProfile.licenseStatus.active') },
    suspended: { icon: <ShieldX size={14} />,    color: 'text-red-600 bg-red-50 border-red-200',   label: t('dealerProfile.licenseStatus.suspended') },
    expired:   { icon: <Clock size={14} />,      color: 'text-amber-600 bg-amber-50 border-amber-200', label: t('dealerProfile.licenseStatus.expired') },
    pending:   { icon: <Clock size={14} />,      color: 'text-brand-muted bg-brand-bg border-brand-border', label: t('dealerProfile.licenseStatus.pending') },
  };

  const tags = dealer.specializations?.split(',').filter(Boolean) || [];
  const sc = STATUS[dealer.license_status] || STATUS.pending;

  return (
    <Link to={`/dealers/${dealer.id}`} id={`dealer-card-${dealer.id}`}
      className="flex flex-col gap-4 bg-brand-surface border border-brand-border rounded-2xl p-5 hover:-translate-y-1 hover:shadow-lg hover:border-emerald-300 transition-all duration-300 cursor-pointer">

      {/* Header */}
      <div className="flex gap-4 items-start items-center justify-between">
        <div className="flex gap-3 items-center min-w-0">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 text-xl font-bold flex items-center justify-center shrink-0">
            {dealer.shop_name?.[0] || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-brand-base break-words line-clamp-1 text-base">{dealer.shop_name}</h3>
            <div className={`mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border ${sc.color} text-[11px] font-semibold capitalize`}>
              {sc.icon} {sc.label}
            </div>
          </div>
        </div>
        <TrustScoreBadge score={dealer.trust_score} />
      </div>

      {/* Meta */}
      <div className="flex flex-col gap-2 mt-2">
        <div className="flex items-start gap-2 text-slate-600 text-sm">
          <MapPin size={14} className="mt-0.5 shrink-0 text-slate-400" />
          <span className="break-words line-clamp-2 text-left leading-tight">{dealer.district_name || dealer.address?.substring(0, 40)}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600 text-sm">
          <Phone size={14} className="shrink-0 text-slate-400" />
          <span>{dealer.phone}</span>
        </div>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-1">
          {tags.map(t => (
             <span key={t} className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium capitalize">
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between pt-3 mt-1 border-t border-brand-subtle text-[11px] text-brand-muted font-medium tracking-wide">
        <span className="uppercase">{dealer.total_reports} {t('components.reports') || 'REPORTS'}</span>
        <span className="uppercase">LIC #{dealer.license_number}</span>
      </div>
    </Link>
  );
}
