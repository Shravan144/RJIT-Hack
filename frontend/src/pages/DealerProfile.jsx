import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import TrustScoreBadge from '../components/TrustScoreBadge';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { MapPin, Phone, Mail, ShieldCheck, ShieldX, Clock, AlertTriangle, ArrowLeft, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function DealerProfile() {
  const { t } = useTranslation();

  const STATUS_CONFIG = {
    active:    { icon: <ShieldCheck size={14} />, cls: 'bg-green-400/10 border-green-400/25 text-green-400',  text: t('dealerProfile.licenseStatus.active') },
    suspended: { icon: <ShieldX size={14} />,    cls: 'bg-red-400/10 border-red-400/25 text-red-400',        text: t('dealerProfile.licenseStatus.suspended') },
    expired:   { icon: <Clock size={14} />,      cls: 'bg-amber-400/10 border-amber-400/25 text-amber-400', text: t('dealerProfile.licenseStatus.expired') },
    pending:   { icon: <Clock size={14} />,      cls: 'bg-slate-700/40 border-slate-600/25 text-slate-500', text: t('dealerProfile.licenseStatus.pending') },
  };
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dealer, setDealer] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([api.get(`/dealers/${id}/`), api.get(`/dealers/${id}/products/`)])
      .then(([dr, pr]) => { setDealer(dr.data); setProducts(pr.data); })
      .catch(() => navigate('/dealers'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error(t('dealerProfile.loginToReview')); return; }
    setSubmitting(true);
    try {
      await api.post(`/dealers/${id}/review/`, reviewForm);
      toast.success(t('dealerProfile.reviewSubmitted'));
      const { data } = await api.get(`/dealers/${id}/`);
      setDealer(data);
    } catch (err) { toast.error(err.response?.data?.detail || t('dealerProfile.reviewFailed')); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="min-h-96 flex items-center justify-center text-slate-500">Loading...</div>;
  if (!dealer) return null;

  const sc = STATUS_CONFIG[dealer.license_status] || STATUS_CONFIG.pending;
  const tabs = ['overview', 'products', 'reviews', 'report'];

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 pb-20">
      <button id="back-btn" className="flex items-center gap-1.5 text-slate-500 text-sm mb-6 hover:text-slate-100 transition-colors"
        onClick={() => navigate(-1)}>
        <ArrowLeft size={15} /> {t('dealerProfile.back')}
      </button>

      {/* ── Header ── */}
      <div className="flex flex-wrap gap-5 items-start bg-[hsl(220,16%,12%)] border border-[hsl(220,14%,20%)] rounded-2xl p-6 mb-6">
        <div className="w-18 h-18 min-w-[72px] aspect-square rounded-2xl bg-gradient-primary text-white text-3xl font-black flex items-center justify-center shadow-glow">
          {dealer.shop_name?.[0]}
        </div>
        <div className="flex-1">
          <h1 className="font-display font-black text-2xl text-slate-100">{dealer.shop_name}</h1>
          <p className="text-slate-400 text-sm mb-2">{dealer.name}</p>
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold mb-1 ${sc.cls}`}>
            {sc.icon} {sc.text}
          </div>
          <p className="text-slate-600 text-xs">{t('dealerProfile.license')}: {dealer.license_number}</p>
        </div>
        <TrustScoreBadge score={dealer.trust_score} />
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 border-b border-[hsl(220,14%,20%)] mb-6">
        {tabs.map(tb => (
          <button key={tb} id={`tab-${tb}`}
            className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-all -mb-px
              ${tab === tb ? 'border-green-400 text-green-400' : 'border-transparent text-slate-500 hover:text-slate-200'}`}
            onClick={() => setTab(tb)}>{t(`dealerProfile.tabs.${tb}`)}</button>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === 'overview' && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2.5">
            {[
              [<MapPin size={13}/>, dealer.address],
              dealer.district && [<span>📍</span>, `${dealer.district.name}, ${dealer.district.state}`],
              [<Phone size={13}/>, dealer.phone],
              dealer.email && [<Mail size={13}/>, dealer.email],
              dealer.license_expiry && [<Clock size={13}/>, `${t('dealerProfile.expires')}: ${dealer.license_expiry}`],
            ].filter(Boolean).map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-slate-400 text-sm">
                <span className="text-slate-600 mt-0.5 shrink-0">{item[0]}</span>
                <span>{item[1]}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              [t('dealerProfile.totalReports'), dealer.total_reports],
              [t('dealerProfile.verifiedReports'), dealer.verified_reports],
              [t('dealerProfile.avgRating'), dealer.avg_rating ?? '—'],
              [t('dealerProfile.trustScore'), dealer.trust_score],
            ].map(([label, val]) => (
              <div key={label} className="bg-[hsl(220,14%,16%)] border border-[hsl(220,14%,20%)] rounded-xl p-4 text-center">
                <div className="font-display font-black text-2xl text-green-400">{val}</div>
                <div className="text-slate-500 text-xs mt-1">{label}</div>
              </div>
            ))}
          </div>

          {dealer.specializations && (
            <div className="flex flex-wrap gap-2">
              {dealer.specializations.split(',').filter(Boolean).map(t => (
                <span key={t} className="px-3 py-1 rounded-full bg-green-400/10 border border-green-400/20 text-green-400 text-xs font-semibold capitalize">{t}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Products ── */}
      {tab === 'products' && (
        products.length === 0
          ? <div className="flex flex-col items-center gap-3 py-16 text-slate-500"><Package size={40} className="opacity-40" /><p>{t('dealerProfile.noProducts')}</p></div>
          : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(dp => <ProductCard key={dp.id} product={dp.product} price={dp.price} inStock={dp.in_stock} />)}
            </div>
      )}

      {/* ── Reviews ── */}
      {tab === 'reviews' && (
        <div className="flex flex-col gap-5">
          {dealer.reviews?.length === 0 && <p className="text-slate-500 text-center py-10">{t('dealerProfile.noReviews')}</p>}
          <div className="flex flex-col gap-3">
            {dealer.reviews?.map(r => (
              <div key={r.id} className="bg-[hsl(220,14%,16%)] border border-[hsl(220,14%,20%)] rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-sm text-slate-100">{r.reviewer_name}</span>
                  <span className="text-amber-400">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span>
                </div>
                <p className="text-slate-400 text-sm">{r.comment}</p>
                <p className="text-slate-600 text-xs mt-2">{new Date(r.created_at).toLocaleDateString('en-IN')}</p>
              </div>
            ))}
          </div>

          {user && (
            <form onSubmit={handleReview} className="bg-[hsl(220,14%,16%)] border border-[hsl(220,14%,20%)] rounded-2xl p-5 flex flex-col gap-4">
              <h3 className="font-bold text-slate-100">{t('dealerProfile.leaveReview')}</h3>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(n => (
                  <button key={n} type="button" id={`star-${n}`}
                    className={`text-2xl transition-colors ${reviewForm.rating >= n ? 'text-amber-400' : 'text-slate-700 hover:text-amber-400'}`}
                    onClick={() => setReviewForm(f => ({ ...f, rating: n }))}>★</button>
                ))}
              </div>
              <textarea id="review-comment" rows={3} placeholder={t('dealerProfile.shareExperience')}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[hsl(220,14%,16%)] border border-[hsl(220,14%,24%)] text-slate-100 text-sm outline-none focus:border-green-400 placeholder-slate-500 resize-y transition-all"
                value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))} />
              <button id="submit-review-btn" type="submit" disabled={submitting}
                className="px-5 py-2.5 rounded-lg bg-gradient-primary text-white font-semibold text-sm disabled:opacity-50 hover:opacity-90 transition-opacity self-start">
                {submitting ? t('dealerProfile.submitting') : t('dealerProfile.submitReview')}
              </button>
            </form>
          )}
        </div>
      )}

      {/* ── Report ── */}
      {tab === 'report' && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <AlertTriangle size={48} className="text-amber-400" />
          <h3 className="font-bold text-xl text-slate-100">{t('dealerProfile.reportDealer')}</h3>
          <p className="text-slate-400 max-w-md">{t('dealerProfile.reportDesc')}</p>
          <button id="goto-report-btn"
            className="px-6 py-3 rounded-xl bg-red-500/80 hover:bg-red-500 border border-red-500 text-white font-semibold transition-all"
            onClick={() => navigate(`/report?dealer=${id}`)}>
            {t('dealerProfile.fileReport')}
          </button>
        </div>
      )}
    </div>
  );
}
