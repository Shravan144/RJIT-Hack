import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, ShieldCheck, Search, AlertTriangle, ArrowRight, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function Home() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', password: '', email: '', role: 'farmer' });
  const [loading, setLoading] = useState(false);

  const features = [
    { icon: <ShieldCheck size={26} />, title: 'Verify Dealers', desc: 'Check license status and trust scores of agri-product dealers.' },
    { icon: <Search size={26} />,      title: 'Find Products', desc: 'Scan barcodes or search to verify product authenticity.' },
    { icon: <AlertTriangle size={26}/>, title: 'Report Fraud',  desc: 'File complaints against fake products or unlicensed dealers.' },
    { icon: <Star size={26} />,         title: 'Trust Scores',  desc: 'Community-driven ratings to protect Indian farmers.' },
  ];

  const stats = [
    { value: '10,000+', label: 'Verified Dealers' },
    { value: '50,000+', label: 'Products Listed' },
    { value: '2,00,000+', label: 'Farmers Protected' },
    { value: '28', label: 'States Covered' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.username, form.password);
        toast.success(`Welcome back, ${form.username}!`);
        navigate('/dealers');
      } else {
        await register({ username: form.username, password: form.password, email: form.email, role: form.role });
        toast.success('Account created! Welcome to AgriVerify.');
        navigate('/dealers');
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      {/* ── Hero ───────────────────────────────── */}
      <section className="relative bg-gradient-hero overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-green-400/5 blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 py-20 flex flex-wrap gap-12 items-center justify-center">

          {/* Copy */}
          <div className="flex-1 min-w-72 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-400/10 border border-green-400/30 text-green-400 text-xs font-semibold mb-5">
              <Leaf size={13} /> Trusted by Indian Farmers
            </div>
            <h1 className="font-display font-black text-5xl md:text-6xl leading-tight mb-5">
              Verify. Trust.<br />
              <span className="gradient-text">Grow Safely.</span>
            </h1>
            <p className="text-slate-400 text-lg mb-8 max-w-lg">
              AgriVerify helps farmers verify agricultural dealers, check product authenticity, and report fraud — in your language, wherever you are.
            </p>
            <div className="flex flex-wrap gap-3">
              <button id="hero-find-dealers"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-primary text-white font-semibold text-base hover:-translate-y-0.5 hover:shadow-glow-lg transition-all"
                onClick={() => navigate('/dealers')}>
                Find Dealers <ArrowRight size={16} />
              </button>
              <button id="hero-scan-product"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[hsl(220,14%,16%)] border border-[hsl(220,14%,24%)] text-slate-200 font-semibold text-base hover:border-green-400 hover:text-white transition-all"
                onClick={() => navigate('/products')}>
                Scan Product
              </button>
            </div>
          </div>

          {/* Auth Card */}
          {!user ? (
            <div className="w-80 bg-[hsl(220,16%,12%)] border border-[hsl(220,14%,24%)] rounded-2xl p-7 shadow-2xl">
              {/* Tabs */}
              <div className="flex border border-[hsl(220,14%,24%)] rounded-lg overflow-hidden mb-5">
                {['login', 'register'].map(m => (
                  <button key={m} id={`${m}-tab`}
                    className={`flex-1 py-2 text-sm font-semibold capitalize transition-all ${mode === m ? 'bg-gradient-primary text-white' : 'text-slate-500 hover:text-slate-200'}`}
                    onClick={() => setMode(m)}>{m}</button>
                ))}
              </div>
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input id="auth-username" type="text" placeholder="Username" required
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[hsl(220,14%,16%)] border border-[hsl(220,14%,24%)] text-slate-100 text-sm outline-none focus:border-green-400 placeholder-slate-500 transition-all"
                  value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
                {mode === 'register' && (
                  <input id="auth-email" type="email" placeholder="Email"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[hsl(220,14%,16%)] border border-[hsl(220,14%,24%)] text-slate-100 text-sm outline-none focus:border-green-400 placeholder-slate-500 transition-all"
                    value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                )}
                <input id="auth-password" type="password" placeholder="Password" required
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[hsl(220,14%,16%)] border border-[hsl(220,14%,24%)] text-slate-100 text-sm outline-none focus:border-green-400 placeholder-slate-500 transition-all"
                  value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
                {mode === 'register' && (
                  <select id="auth-role"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[hsl(220,14%,16%)] border border-[hsl(220,14%,24%)] text-slate-100 text-sm outline-none focus:border-green-400 transition-all cursor-pointer"
                    value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                    <option value="farmer">Farmer</option>
                    <option value="dealer">Dealer</option>
                    <option value="inspector">Inspector</option>
                  </select>
                )}
                <button id="auth-submit" type="submit" disabled={loading}
                  className="mt-1 py-2.5 rounded-lg bg-gradient-primary text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">
                  {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
                </button>
              </form>
            </div>
          ) : (
            <div className="w-80 bg-[hsl(220,16%,12%)] border border-[hsl(220,14%,24%)] rounded-2xl p-7 shadow-2xl flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-primary text-white text-3xl font-black flex items-center justify-center">
                {user.username[0].toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-100">Welcome, {user.username}!</h3>
                <p className="text-slate-500 text-sm capitalize">{user.role}</p>
              </div>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-primary text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                onClick={() => navigate('/dealers')}>
                Explore Dealers <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Stats ──────────────────────────────── */}
      <section className="bg-[hsl(220,16%,12%)] border-y border-[hsl(220,14%,20%)]">
        <div className="max-w-5xl mx-auto px-6 py-10 flex flex-wrap justify-center">
          {stats.map((s, i) => (
            <div key={s.label} className={`flex-1 min-w-36 px-8 py-4 text-center ${i < stats.length-1 ? 'border-r border-[hsl(220,14%,20%)]' : ''}`}>
              <div className="font-display font-black text-3xl text-green-400">{s.value}</div>
              <div className="text-slate-400 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ───────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="font-display font-black text-4xl mb-3">Everything farmers need</h2>
        <p className="text-slate-400 mb-12">One platform to verify, discover, and report in your local language.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(f => (
            <div key={f.title}
              className="bg-gradient-card border border-[hsl(220,14%,20%)] rounded-2xl p-8 text-center hover:-translate-y-1 hover:shadow-glow hover:border-green-400/30 transition-all duration-300">
              <div className="inline-flex p-3.5 rounded-xl bg-green-400/10 text-green-400 mb-4">{f.icon}</div>
              <h3 className="font-bold text-base mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────── */}
      <section className="bg-gradient-to-r from-[hsl(142,80%,12%)] to-[hsl(173,80%,10%)] border-y border-green-400/20 py-16 text-center px-6">
        <h2 className="font-display font-black text-3xl mb-3">Protect yourself from agri-fraud</h2>
        <p className="text-slate-400 mb-7">File a report today — it takes less than 2 minutes.</p>
        <button id="cta-report-btn"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-primary text-white font-semibold text-base hover:-translate-y-0.5 hover:shadow-glow-lg transition-all"
          onClick={() => navigate('/report')}>
          File a Report <ArrowRight size={16} />
        </button>
      </section>
    </main>
  );
}
