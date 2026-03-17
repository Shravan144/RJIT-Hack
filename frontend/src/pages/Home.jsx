import { useNavigate } from 'react-router-dom';
import { Leaf, ShieldCheck, Search, AlertTriangle, ArrowRight, Star, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DealerMap from './DealerMap';
import { useTranslation } from "react-i18next";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const features = [
    { icon: <ShieldCheck size={28} />, title: t("features.verify.title"), desc: t("features.verify.desc") },
    { icon: <Search size={28} />,      title: t("features.products.title"), desc: t("features.products.desc") },
    { icon: <AlertTriangle size={28}/>, title: t("features.report.title"),  desc: t("features.report.desc") },
    { icon: <Star size={28} />,         title: t("features.trust.title"),  desc: t("features.trust.desc") },
  ];

  const stats = [
    { value: '10,000+', label: t("stats.dealers") },
    { value: '50,000+', label: t("stats.products") },
    { value: '2,00,000+', label: t("stats.farmers") },
    { value: '28', label: t("stats.states") },
  ];

  return (
    <main className="overflow-hidden bg-brand-bg min-h-screen">
      {/* ── Hero ───────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-brand-border min-h-[85vh] flex items-center">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop")' }}
        >
          {/* Gradient overlay to ensure text legibility - darkens the left side where text lives */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-900/80 to-emerald-900/30 dark:from-slate-950/95 dark:via-slate-900/80 dark:to-slate-900/40"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-20 pb-16 md:pt-28 md:pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center w-full relative z-10">

          {/* Copy */}
          <div className="lg:col-span-6 text-center md:text-left flex flex-col items-center md:items-start z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold tracking-widest uppercase mb-8 backdrop-blur-md shadow-sm">
              <Leaf size={14} /> {t("hero.trusted")}
            </div>

            <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl leading-[1.1] mb-6 text-white tracking-tight text-balance">
              {t("hero.verify")}<br className="hidden md:block" />
              <span className="text-emerald-400">{t("hero.grow")}</span>
            </h1>

            <p className="text-emerald-50/90 text-lg md:text-xl mb-10 max-w-lg text-balance leading-relaxed">
              {t("hero.description")}
            </p>

            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <button id="hero-find-dealers"
                className="flex items-center gap-2 px-8 py-4 rounded-xl bg-emerald-500 text-white font-bold text-base hover:bg-emerald-400 hover:scale-105 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
                onClick={() => navigate('/dealers')}>
                {t("hero.findDealers")} <ArrowRight size={18} />
              </button>

              <button id="hero-scan-product"
                className="flex items-center gap-2 px-8 py-4 rounded-xl bg-white/10 backdrop-blur-md border-2 border-white/20 text-white font-bold text-base hover:bg-white/20 hover:border-white/40 transition-all shadow-sm"
                onClick={() => navigate('/products')}>
                {t("hero.scanProduct")}
              </button>
            </div>
            
            <div className="mt-12 flex flex-wrap items-center gap-6 justify-center md:justify-start text-sm font-semibold text-emerald-200/80">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-emerald-400" size={18} /> Transparent
              </div>
              <div className="flex items-center gap-2">
                <Search className="text-blue-400" size={18} /> Fast
              </div>
              <div className="flex items-center gap-2">
                <Star className="text-amber-400" size={18} /> Verified
              </div>
            </div>
          </div>

          {/* Map Feature Layout */}
          <div className="lg:col-span-6 w-full relative z-10 hidden md:block">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 shadow-2xl relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-3xl pointer-events-none"></div>
              <div className="flex items-center justify-between mb-4 px-2 relative z-10">
                <h3 className="font-display text-lg font-bold text-white shadow-sm">{t("hero.nearbyDealers")}</h3>
                <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 backdrop-blur-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Map
                </div>
              </div>
              <div className="rounded-2xl overflow-hidden border border-white/20 bg-brand-bg h-[380px] shadow-inner relative z-10">
                <DealerMap/>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Stats ──────────────────────────────── */}
      <section className="bg-brand-surface border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-wrap justify-between items-center bg-brand-surface divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {stats.map((s, i) => (
            <div key={s.label} className="w-full md:w-auto flex-1 min-w-[200px] text-center py-6 md:py-0">
              <div className="font-display font-extrabold text-4xl text-emerald-600 mb-1">{s.value}</div>
              <div className="text-brand-muted text-sm font-bold uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ───────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h2 className="font-display font-bold text-3xl md:text-5xl mb-4 text-brand-base tracking-tight text-balance">
          {t("features.heading")}
        </h2>

        <p className="text-slate-600 text-lg mb-16 max-w-2xl mx-auto text-balance">
          {t("features.subheading")}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={f.title}
              className={`bg-brand-surface border border-brand-border shadow-sm rounded-2xl p-8 text-left hover:-translate-y-2 hover:shadow-xl hover:border-emerald-300 transition-all duration-300 stagger-in ${i % 2 === 0 ? 'lg:translate-y-4' : ''}`}>
              <div className="inline-flex p-4 rounded-xl bg-emerald-50 text-emerald-600 mb-6 border border-emerald-100">{f.icon}</div>
              <h3 className="font-bold text-lg text-brand-base mb-3">{f.title}</h3>
              <p className="text-brand-muted text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────── */}
      <section className="px-6 pb-24">
        <div className="max-w-7xl mx-auto rounded-3xl bg-slate-900 py-20 text-center px-6 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-20" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-20" />
          
          <div className="relative z-10">
            <h2 className="font-display font-bold text-3xl md:text-5xl mb-6 text-white text-balance tracking-tight">
              {t("cta.title")}
            </h2>

            <p className="text-slate-300 text-lg mb-10 max-w-2xl mx-auto text-balance leading-relaxed">
              {t("cta.desc")}
            </p>

            <button id="cta-report-btn"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-emerald-500 text-white font-bold text-lg hover:bg-emerald-400 hover:-translate-y-1 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              onClick={() => navigate('/report')}>
              {t("cta.button")} <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}