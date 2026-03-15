import { useNavigate } from 'react-router-dom';
import { Leaf, ShieldCheck, Search, AlertTriangle, ArrowRight, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DealerMap from './DealerMap';
import { useTranslation } from "react-i18next";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const features = [
    { icon: <ShieldCheck size={26} />, title: t("features.verify.title"), desc: t("features.verify.desc") },
    { icon: <Search size={26} />,      title: t("features.products.title"), desc: t("features.products.desc") },
    { icon: <AlertTriangle size={26}/>, title: t("features.report.title"),  desc: t("features.report.desc") },
    { icon: <Star size={26} />,         title: t("features.trust.title"),  desc: t("features.trust.desc") },
  ];

  const stats = [
    { value: '10,000+', label: t("stats.dealers") },
    { value: '50,000+', label: t("stats.products") },
    { value: '2,00,000+', label: t("stats.farmers") },
    { value: '28', label: t("stats.states") },
  ];

  return (
    <main>
      {/* ── Hero ───────────────────────────────── */}
      <section className="relative bg-gradient-hero overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-green-400/5 blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 py-20 flex flex-wrap gap-12 items-center justify-center">

          {/* Copy */}
          <div className="flex-1 min-w-72 max-w-2xl text-center md:text-left flex flex-col items-center md:items-start">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-400/10 border border-green-400/30 text-green-400 text-xs font-semibold mb-5">
              <Leaf size={13} /> {t("hero.trusted")}
            </div>

            <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl leading-snug mb-5 break-words">
              {t("hero.verify")}<br />
              <span className="gradient-text">{t("hero.grow")}</span>
            </h1>

            <p className="text-brand-muted text-lg mb-8 max-w-lg">
              {t("hero.description")}
            </p>

            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <button id="hero-find-dealers"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-primary text-white font-semibold text-base hover:-translate-y-0.5 hover:shadow-glow-lg transition-all"
                onClick={() => navigate('/dealers')}>
                {t("hero.findDealers")} <ArrowRight size={16} />
              </button>

              <button id="hero-scan-product"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-elevated border border-brand-border text-brand-base font-semibold text-base hover:border-green-400 hover:text-brand-base transition-all"
                onClick={() => navigate('/products')}>
                {t("hero.scanProduct")}
              </button>
            </div>
          </div>

          {/* Map */}
          <div className="flex-1 min-w-72 max-w-2xl w-full">
            <h3 className="text-2xl font-bold mb-4">
              {t("hero.nearbyDealers")}
            </h3>
            <div className="rounded-2xl overflow-hidden border border-brand-border shadow-2xl">
              <DealerMap/>
            </div>
          </div>

        </div>
      </section>

      {/* ── Stats ──────────────────────────────── */}
      <section className="bg-brand-surface border-y border-brand-subtle">
        <div className="max-w-5xl mx-auto px-6 py-10 flex flex-wrap justify-center">
          {stats.map((s, i) => (
            <div key={s.label} className={`flex-1 min-w-36 px-8 py-4 text-center ${i < stats.length-1 ? 'border-r border-brand-subtle' : ''}`}>
              <div className="font-display font-black text-3xl text-green-400">{s.value}</div>
              <div className="text-brand-muted text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ───────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="font-display font-black text-4xl mb-3">
          {t("features.heading")}
        </h2>

        <p className="text-brand-muted mb-12">
          {t("features.subheading")}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(f => (
            <div key={f.title}
              className="bg-gradient-card border border-brand-subtle rounded-2xl p-8 text-center hover:-translate-y-1 hover:shadow-glow hover:border-green-400/30 transition-all duration-300">
              <div className="inline-flex p-3.5 rounded-xl bg-green-400/10 text-green-400 mb-4">{f.icon}</div>
              <h3 className="font-bold text-base mb-2">{f.title}</h3>
              <p className="text-brand-muted text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────── */}
      <section className="bg-gradient-to-r from-[hsl(142,80%,12%)] to-[hsl(173,80%,10%)] border-y border-green-400/20 py-16 text-center px-6">
        <h2 className="font-display font-black text-3xl mb-3 text-white">
          {t("cta.title")}
        </h2>

        <p className="text-white/80 mb-7">
          {t("cta.desc")}
        </p>

        <button id="cta-report-btn"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-primary text-white font-semibold text-base hover:-translate-y-0.5 hover:shadow-glow-lg transition-all"
          onClick={() => navigate('/report')}>
          {t("cta.button")} <ArrowRight size={16} />
        </button>
      </section>
    </main>
  );
}