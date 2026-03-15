import { useTranslation } from "react-i18next";

export default function TrustScoreBadge({ score }) {
  const { t } = useTranslation();

  const getConfig = (s) => {
    if (s >= 4.5) return { label: t('components.excellent'), color: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/30',  bar: 'bg-green-400' };
    if (s >= 3.5) return { label: t('components.good'),      color: 'text-teal-400',   bg: 'bg-teal-400/10',   border: 'border-teal-400/30',   bar: 'bg-teal-400'  };
    if (s >= 2.5) return { label: t('components.fair'),      color: 'text-amber-400',  bg: 'bg-amber-400/10',  border: 'border-amber-400/30',  bar: 'bg-amber-400' };
    return          { label: t('components.poor'),      color: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/30',    bar: 'bg-red-400'   };
  };

  const cfg = getConfig(score);
  const pct = Math.min(100, (score / 5) * 100);

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${cfg.bg} ${cfg.border} shrink-0 min-w-[fit-content]`}>
      <div className={`text-xl font-black ${cfg.color}`}>{score?.toFixed(1)}</div>
      <div className="flex flex-col gap-0.5">
        <div className={`text-[10px] font-bold uppercase tracking-wide ${cfg.color}`}>{cfg.label}</div>
        <div className="w-12 h-1 rounded-full bg-brand-card overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${cfg.bar}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}
