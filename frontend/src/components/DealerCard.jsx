import { Link } from 'react-router-dom';
import { MapPin, Phone, ShieldCheck, ShieldX, Clock } from 'lucide-react';
import TrustScoreBadge from './TrustScoreBadge';
import { useTranslation } from "react-i18next";

export default function DealerCard({ dealer }) {
  const { t } = useTranslation();

  const STATUS = {
    active:    { icon: <ShieldCheck size={13} />, color: 'text-green-400', label: t('dealerProfile.licenseStatus.active') },
    suspended: { icon: <ShieldX size={13} />,    color: 'text-red-400',   label: t('dealerProfile.licenseStatus.suspended') },
    expired:   { icon: <Clock size={13} />,      color: 'text-amber-400', label: t('dealerProfile.licenseStatus.expired') },
    pending:   { icon: <Clock size={13} />,      color: 'text-slate-500', label: t('dealerProfile.licenseStatus.pending') },
  };

  const tags = dealer.specializations?.split(',').filter(Boolean) || [];
  const sc = STATUS[dealer.license_status] || STATUS.pending;

  return (
    <Link to={`/dealers/${dealer.id}`} id={`dealer-card-${dealer.id}`}
      className="flex flex-col gap-3 bg-gradient-card border border-[hsl(220,14%,20%)] rounded-2xl p-5 hover:-translate-y-1 hover:shadow-xl hover:border-green-400/30 transition-all duration-300 cursor-pointer">

      {/* Header */}
      <div className="flex gap-3 items-start">
        <div className="w-12 h-12 rounded-xl bg-gradient-primary text-white text-xl font-black flex items-center justify-center shrink-0">
          {dealer.shop_name?.[0] || 'A'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-100 truncate text-sm">{dealer.shop_name}</h3>
          <p className="text-slate-500 text-xs">{dealer.name}</p>
          <div className={`flex items-center gap-1 mt-0.5 ${sc.color} text-xs font-semibold capitalize`}>
            {sc.icon} {sc.label}
          </div>
        </div>
        <TrustScoreBadge score={dealer.trust_score} />
      </div>

      {/* Meta */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
          <MapPin size={12} className="text-slate-500 shrink-0" />
          <span className="truncate">{dealer.district_name || dealer.address?.substring(0, 40)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
          <Phone size={12} className="text-slate-500 shrink-0" />
          <span>{dealer.phone}</span>
        </div>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map(t => (
            <span key={t} className="px-2.5 py-0.5 rounded-full bg-green-400/10 border border-green-400/25 text-green-400 text-[11px] font-semibold capitalize">
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between pt-2 border-t border-[hsl(220,14%,20%)] text-[11px] text-slate-500">
        <span>{dealer.total_reports} {t('components.reports')}</span>
        <span>#{dealer.license_number}</span>
      </div>
    </Link>
  );
}
