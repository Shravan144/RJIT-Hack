import { useTranslation } from "react-i18next";

export default function TrustScoreBadge({ score }) {
  const { t } = useTranslation();

  const getConfig = (s) => {
    if (s >= 4.5) return { label: t('components.excellent'), ring: 'stroke-blue-500',  text: 'text-blue-700' };
    if (s >= 3.5) return { label: t('components.good'),      ring: 'stroke-emerald-500', text: 'text-emerald-700' };
    if (s >= 2.5) return { label: t('components.fair'),      ring: 'stroke-amber-500',  text: 'text-amber-700' };
    return          { label: t('components.poor'),      ring: 'stroke-red-500',    text: 'text-red-700' };
  };

  const cfg = getConfig(score || 0);
  const pct = Math.min(100, ((score || 0) / 5) * 100);
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-xl border border-brand-border bg-brand-surface shadow-sm shrink-0 w-fit">
      <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
          <circle className="stroke-slate-100" strokeWidth="4" fill="transparent" r={radius} cx="20" cy="20" />
          <circle 
            className={`${cfg.ring} transition-all duration-1000 ease-out`} 
            strokeWidth="4" 
            strokeDasharray={circumference} 
            strokeDashoffset={dashoffset} 
            strokeLinecap="round"
            fill="transparent" 
            r={radius} 
            cx="20" 
            cy="20" 
          />
        </svg>
        <span className="absolute text-[11px] font-bold text-slate-800">{score?.toFixed(1) || '0.0'}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Trust Score</span>
        <span className={`text-xs font-bold ${cfg.text}`}>{cfg.label}</span>
      </div>
    </div>
  );
}
